import { walletStore } from "./walletStore.svelte"
import { formatEther, type Account } from "viem"
import type { EvmAddress } from "./types"
import { signInWithEthereum } from "./siwe"
import { publicClient } from "./mud/setupNetwork"
import { displayNameStore } from "./displayNameStore.svelte"
import { prices } from "./prices.svelte"
import { formatAsDollar } from "./util"

const initialState = {
  address: undefined,
  authenticated: false,
  balance: 0n,
}

const makeBalanceSync = (setBalance: (balance: bigint) => any) => {
  let started = false
  let syncInterval: NodeJS.Timeout | null = null

  async function updateBalance(address: EvmAddress) {
    const balance = await publicClient.getBalance({ address })
    setBalance(balance)
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
    balance: bigint
    displayName?: string
  }>(initialState)

  const balanceSync = makeBalanceSync((balance: bigint) => {
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
        balanceSync.start(wallet.address)
        userState.address = wallet.address
        userState.displayName = await displayNameStore.fetch(wallet.address)

        try {
          if (!wallet.walletClient?.signMessage) {
            throw new Error("No SIWE Signer Available")
          }

          userState.authenticated = await signInWithEthereum(
            wallet.address,
            wallet.walletClient.signMessage,
          )

          console.log("Authenticated", wallet.address)
        } catch (error) {
          walletStore.disconnect()
          console.error(
            "Failed to sign in with Ethereum, disconnecting wallet:",
            error,
          )
        }
      } else {
        console.log("Signing out")

        // Perform logout request
        const response = await fetch("/api/siwe-auth/logout", {
          method: "POST",
          credentials: "include",
        })

        if (response.ok) {
          console.log("Logout successful")
          userState.authenticated = false
        } else {
          console.error("Logout failed")
        }
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

    get balanceEth() {
      return Number(formatEther(userState.balance)).toFixed(2)
    },

    get balanceUsd() {
      return formatAsDollar(Number(formatEther(userState.balance)) * prices.eth)
    },

    onDisplayNameChange: (displayName: string) => {
      userState.displayName = displayName
    },

    onWalletChange,
  }
})()
