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
  reconnect,
  watchAccount,
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

  return cbWalletConnector
}

export const chain = networkConfig.chain

export const walletStore = (() => {
  let wallet = $state<Wallet | undefined>()
  let connecting = $state(false)

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
      connector: await getPrimaryConnector(),
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
      connecting = true

      try {
        if (networkConfig.chainId === 31337) {
          return connectBurner()
        } else {
          return connectWallet()
        }
      } finally {
        connecting = false
      }
    },

    autoConnect: async () => {
      connecting = true

      try {
        if (networkConfig.chainId === 31337) {
          return connectBurner()
        } else {
          const [account] = await reconnect(wagmiConfig, {
            connectors: [await getPrimaryConnector()],
          })

          if (account) {
            const walletClient = await getWalletClient(wagmiConfig)
            wallet = walletClient

            return walletClient
          }
        }
      } finally {
        connecting = false
      }
    },

    disconnect: async () => {
      try {
        await disconnect(wagmiConfig)
      } catch (err) {
        console.warn("Wallet disconnect failed")
      }

      user.changeAccount({ address: undefined })
      wallet = undefined
    },
  }
})()

watchAccount(wagmiConfig, {
  onChange: async (account) => {
    const isTransient = account.isConnecting || account.isReconnecting
    if (account.address !== user.address && !isTransient) {
      console.log("detected account change", account)
      user.changeAccount({ address: account.address })
    }
  },
})
