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
  switchChain,
  watchAccount,
  type CreateConnectorFn,
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

let frameConnector: CreateConnectorFn
if (browser) {
  // Frame connector must be imported dynamically on client
  import("./farcaster/farcasterFramesConnector").then(
    ({ frameConnector: createConnector }) => {
      frameConnector = createConnector()
    },
  )
}

const getPrimaryConnector = () => {
  if (!browser) throw new Error("Not in browser")

  if (frameStore.initialized) {
    return frameConnector
  }

  return cbWalletConnector
}

export const chain = networkConfig.chain

export const walletStore = (() => {
  let wallet = $state<Wallet | undefined>()
  let connecting = $state(false)

  // Burner account keys are not stored securely and should not be used to directlylhold funds
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
      chainId: networkConfig.chainId,
      connector: getPrimaryConnector(),
    })

    const walletClient = await getWalletClient(wagmiConfig)

    wallet = walletClient
    return walletClient
  }

  return {
    get connecting() {
      return connecting
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
          return await connectWallet()
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
            connectors: [getPrimaryConnector()],
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
        user.changeAccount({ address: undefined })
      }

      wallet = undefined
    },
  }
})()

watchAccount(wagmiConfig, {
  onChange: async (account) => {
    console.log("detected account change", account)
    const isTransient = account.isConnecting || account.isReconnecting
    if (account.address !== user.address && !isTransient) {
      console.log("applying account change")
      user.changeAccount({ address: account.address })
    }

    if (account.isConnected && account.chainId !== networkConfig.chainId) {
      switchChain(wagmiConfig, { chainId: networkConfig.chainId })
    }
  },
})
