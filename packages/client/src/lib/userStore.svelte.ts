import { walletStore } from "./walletStore.svelte"
import { formatEther, type Account } from "viem"
import type { EvmAddress } from "./types"
import { signInWithEthereum } from "./siwe"
import { publicClient } from "./mud/setupNetwork"

const initialState = {
  address: undefined,
  authenticated: false,
  balance: "0.00",
}

const makeBalanceSync = (setBalance: (balance: string) => any) => {
  let started = false
  let syncInterval: NodeJS.Timeout | null = null

  async function updateBalance(address: EvmAddress) {
    const balance = await publicClient.getBalance({ address })
    const formattedBalance = Number(formatEther(balance)).toFixed(4)
    setBalance(formattedBalance)
  }

  return {
    start: async (address: EvmAddress, interval = 4000) => {
      if (started) return
      started = true

      updateBalance(address)

      syncInterval = setInterval(() => {
        updateBalance(address)
      }, interval)
    },

    stop: () => {
      if (syncInterval) clearInterval(syncInterval)
      started = false
    },
  }
}

export const user = (() => {
  let userState = $state<{
    address: EvmAddress | undefined
    authenticated: boolean
    balance: string
    displayName?: string
  }>(initialState)

  const balanceSync = makeBalanceSync((balance: string) => {
    // Only update store when balance has changed
    if (balance !== userState.balance) {
      userState.balance = balance
    }
  })

  const onWalletChange = async (wallet: typeof walletStore) => {
    if (userState.address !== wallet.address) {
      console.log("Sync user to wallet")
      balanceSync.stop()
      userState = { ...initialState }

      if (wallet.address) {
        console.log("Address available, signing in")
        userState.address = wallet.address
        balanceSync.start(wallet.address)

        if (!wallet.walletClient?.signMessage) {
          throw new Error("No SIWE Signer Available")
        }

        userState.authenticated = await signInWithEthereum(
          wallet.address,
          wallet.walletClient.signMessage,
        )
      } else {
        console.log("Signing out (todo)")
        // TODO: When address changes to none (disconnected), we should logout
      }
    }
  }

  return {
    get address() {
      return userState.address
    },
    get authenticated() {
      return userState.authenticated
    },
    get displayName() {
      return userState.displayName
    },
    get balance() {
      return userState.balance
    },

    onWalletChange,
  }
})()
