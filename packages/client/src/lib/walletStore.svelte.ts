import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common"
import { createWalletClient, http, webSocket, type Account } from "viem"
import { networkConfig } from "./mud/networkConfig"
import { type Wallet } from "./mud/setupNetwork"
import { browser, version } from "$app/environment"
import {
  connect,
  createConfig,
  disconnect,
  fallback,
  getWalletClient,
  injected,
  reconnect,
  watchAccount,
  watchClient,
  type Connector,
} from "@wagmi/core"

import { coinbaseWallet, metaMask } from "@wagmi/connectors"
import { frameStore } from "./farcaster/frameStore.svelte"
import { user } from "./userStore.svelte"

if (browser) window.process = { env: {}, version } as any

export const wagmiConfig = createConfig({
  chains: [networkConfig.chain],
  transports: {
    [networkConfig.chainId]: fallback([webSocket(), http()]),
  },
})

const cbWalletConnector = coinbaseWallet({
  appName: "Puzzle Bets",
  preference: "smartWalletOnly",
})

const getPrimaryConnector = async () => {
  if (!browser) throw new Error("Not in browser")

  if (frameStore.initialized) {
    const { frameConnector } = await import(
      "./farcaster/farcasterFramesConnector"
    )
    return frameConnector()
  }

  return injected()
}

export const chain = networkConfig.chain

export const walletStore = (() => {
  let wallet = $state<Wallet | undefined>()
  let connecting = $state(false)
  let connector = $state<any>()

  if (browser) {
    getPrimaryConnector().then((c) => {
      connector = c
    })
  }

  const connectBurner = () => {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey())
    const walletClient = createWalletClient({
      ...networkConfig,
      account: burnerAccount as any,
    }) as Wallet

    wallet = walletClient
    return walletClient
  }

  const connectWallet = async () => {
    await connect(wagmiConfig, {
      connector,
    })

    const walletClient = await getWalletClient(wagmiConfig)
    wallet = walletClient
    return walletClient
  }

  return {
    get connecting() {
      return connecting
    },

    get address() {
      return wallet?.account.address
    },

    get walletClient() {
      return wallet
    },

    connect: async () => {
      if (networkConfig.chainId === 31337) {
        return connectBurner()
      } else {
        return connectWallet()
      }
    },

    autoConnect: async () => {
      if (networkConfig.chainId === 31337) {
        return connectBurner()
      } else {
        const [account] = await reconnect(wagmiConfig, {
          connectors: [connector],
        })

        if (account) {
          const walletClient = await getWalletClient(wagmiConfig)
          wallet = walletClient

          return walletClient
        }
      }
    },

    disconnect: async () => {
      try {
        await disconnect(wagmiConfig, { connector })
      } catch (err) {
        console.error("Disconnect failed: ", err)
        // Manually remove the account from the user store when disconnecting fails (not all connectors support disconnecting)
        user.changeAccount({ address: undefined })
      }
      wallet = undefined
    },
  }
})()

let changingAccount = false
watchAccount(wagmiConfig, {
  onChange: async (account) => {
    if (changingAccount) return

    console.log("changing account:", account)
    changingAccount = true
    try {
      await user.changeAccount({ address: account.address })
    } finally {
      changingAccount = false
    }
  },
})
