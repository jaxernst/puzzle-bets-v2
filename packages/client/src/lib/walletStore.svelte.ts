import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common"
import { createWalletClient, http, webSocket, type Account } from "viem"
import { networkConfig } from "./mud/networkConfig"
import { type Wallet } from "./mud/setupNetwork"
import { browser, version } from "$app/environment"
import {
  connect,
  createConfig,
  fallback,
  getWalletClient,
  reconnect,
} from "@wagmi/core"
import { coinbaseWallet } from "@wagmi/connectors"

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

  const connectSmartWallet = async () => {
    await connect(wagmiConfig, {
      connector: cbWalletConnector,
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
        return connectSmartWallet()
      }
    },

    autoConnect: async () => {
      if (networkConfig.chainId === 31337) {
        return connectBurner()
      } else {
        const [account] = await reconnect(wagmiConfig, {
          connectors: [cbWalletConnector],
        })

        if (account) {
          const walletClient = await getWalletClient(wagmiConfig)
          wallet = walletClient
        }
      }
    },
    disconnect: async () => {
      wallet = undefined
    },
  }
})()
