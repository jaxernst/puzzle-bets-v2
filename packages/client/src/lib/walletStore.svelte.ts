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
} from "@wagmi/core"

import { coinbaseWallet } from "@wagmi/connectors"

if (browser) window.process = { env: {}, version } as any

/** Wallet Store Farcaster Frame V2 Support:
When connecting to a wallet, we check to see if we've launched in the farcaster client, and so we use the frames connector.
 */

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

  const framesSdk = (await import("@farcaster/frame-sdk")).sdk
  const framesCtx = await framesSdk.context

  if (framesCtx) {
    const { frameConnector } = await import(
      "./connectors/farcasterFramesConnector"
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
    const connector = await getPrimaryConnector()

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
          connectors: [await getPrimaryConnector()],
        })

        if (account) {
          const walletClient = await getWalletClient(wagmiConfig)
          wallet = walletClient

          return walletClient
        }
      }
    },

    disconnect: async () => {
      disconnect(wagmiConfig)
      wallet = undefined
    },
  }
})()
