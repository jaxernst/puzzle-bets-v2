import { networkConfig } from "./mud/networkConfig"
import { type Wallet } from "./mud/setupNetwork"
import { getConnectors, getFrameConnector } from "./walletConnectors"
import {
  connect,
  disconnect,
  getWalletClient,
  reconnect,
  switchChain,
  watchAccount,
  fallback,
  http,
  webSocket,
  type GetAccountReturnType,
} from "@wagmi/core"

import { createAppKit } from "@reown/appkit"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { frameStore } from "./farcaster/frameStore.svelte"

// Wallet connect modal config
const projectId = "226a30717601f2bb0c6782d18597f828"

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [networkConfig.chain],
  transports: {
    [networkConfig.chainId]: fallback([webSocket(), http()]),
  },
})

const metadata = {
  name: "Puzzle Bets",
  description: "Play wagered puzzle games with your friends.",
  url: "https://beta.puzzlebets.xyz",
  icons: ["https://beta.puzzlebets.xyz/favicon.ico"],
}

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [networkConfig.chain],
  metadata,
  projectId,
  features: {
    analytics: true,
  },
})

export type WagmiConfig = typeof wagmiConfig

export const wagmiConfig = wagmiAdapter.wagmiConfig

/* Currently not used: wagmi config accessed through connect modal adapter
export const wagmiConfig = createConfig({
  chains: [networkConfig.chain],
  transports: {
    [networkConfig.chainId]: fallback([webSocket(), http()]),
  },
})
*/

export const walletStore = makeWalletStore(wagmiConfig)

function makeWalletStore(wagmiConfig: WagmiConfig) {
  let wallet = $state<Wallet | undefined>()
  let connecting = $state(false)

  const getWalletAndUpdateClient = async () => {
    const client = await getWalletClient(wagmiConfig)
    wallet = client
    return client
  }

  const connectWithModal = async () => {
    await modal.open()

    return new Promise((resolve) => {
      const unsub = modal.subscribeState(async (state) => {
        if (!state.open) {
          unsub()
          resolve(await getWalletAndUpdateClient())
        }
      })
    })
  }

  const connectWithFramesConnector = async () => {
    await connect(wagmiConfig, {
      chainId: networkConfig.chainId,
      connector: getFrameConnector(),
    })
    return await getWalletAndUpdateClient()
  }

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

    connect: async () => {
      connecting = true

      try {
        if (frameStore.initialized) {
          return await connectWithFramesConnector()
        } else {
          return await connectWithModal()
        }
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
