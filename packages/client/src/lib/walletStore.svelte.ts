import { http, webSocket, type Account } from "viem"
import { networkConfig } from "./mud/networkConfig"
import { type Wallet } from "./mud/setupNetwork"
import {
  connect,
  createConfig,
  disconnect,
  fallback,
  getWalletClient,
  reconnect,
  switchChain,
  watchAccount,
  type Connector,
  type CreateConnectorFn,
  type GetAccountReturnType,
} from "@wagmi/core"
import { getConnectors, getDefaultConnector } from "./walletConnectors"

export type WagmiConfig = typeof wagmiConfig

export const wagmiConfig = createConfig({
  chains: [networkConfig.chain],
  transports: {
    [networkConfig.chainId]: fallback([webSocket(), http()]),
  },
})

export const walletStore = makeWalletStore(wagmiConfig)

function makeWalletStore(wagmiConfig: WagmiConfig) {
  let wallet = $state<Wallet | undefined>()
  let connecting = $state(false)

  // Ensure we stay on the correct chain
  watchAccount(wagmiConfig, {
    onChange: (account) => {
      if (account.isConnected && account.chainId !== networkConfig.chainId) {
        switchChain(wagmiConfig, { chainId: networkConfig.chainId })
      }
    },
  })

  return {
    get connecting() {
      return connecting
    },

    get walletClient() {
      return wallet
    },

    connect: async (connector?: Connector | CreateConnectorFn) => {
      connecting = true

      try {
        await connect(wagmiConfig, {
          chainId: networkConfig.chainId,
          connector: connector ?? getDefaultConnector(),
        })

        const walletClient = await getWalletClient(wagmiConfig)

        wallet = walletClient
        return walletClient
      } finally {
        connecting = false
      }
    },

    autoConnect: async () => {
      connecting = true

      try {
        const [account] = await reconnect(wagmiConfig, {
          connectors: getConnectors(),
        })

        if (account) {
          const walletClient = await getWalletClient(wagmiConfig)
          wallet = walletClient
          return walletClient
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

      wallet = undefined
    },

    onAccountChange: (
      onChange: (
        cur: GetAccountReturnType<WagmiConfig>,
        prev: GetAccountReturnType<WagmiConfig>,
      ) => void,
    ) => {
      watchAccount(wagmiConfig, { onChange })
    },
  }
}
