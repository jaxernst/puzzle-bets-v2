import { formatEther } from "viem"
import type { EvmAddress } from "./types"
import { signInWithEthereum } from "./siwe"
import { publicClient, type Wallet } from "./mud/setupNetwork"
import { displayNameStore } from "./displayNameStore.svelte"
import { prices } from "./prices.svelte"
import { formatAsDollar, formatSigFig } from "./util"

const initialState = {
  address: undefined,
  authenticated: undefined,
  balance: 0n,
  balanceFetched: false,
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
    authenticated: EvmAddress | undefined
    balance: bigint
    balanceFetched: boolean
    displayName?: string
  }>(initialState)

  const balanceSync = makeBalanceSync((balance: bigint) => {
    // Only update store when balance has changed
    if (balance !== userState.balance) {
      userState.balance = balance
      userState.balanceFetched = true
    }
  })

  const logout = async () => {
    const response = await fetch("/api/siwe-auth/logout", {
      method: "POST",
      credentials: "include",
    })

    if (response.ok) {
      console.log("Logout successful")
      userState.authenticated = undefined
    } else {
      console.error("Logout failed")
    }
  }

  const handleWalletChange = async (wallet: Wallet | null) => {
    const address = wallet?.account.address

    balanceSync.stop()

    if (address) {
      if (address !== userState.authenticated) {
        try {
          if (!wallet.signMessage) {
            throw new Error("No SIWE Signer Available")
          }

          const success = await signInWithEthereum(address, wallet.signMessage)

          if (success) {
            userState.authenticated = address
          }
        } catch (error) {
          console.error("Failed to sign in with Ethereum", error)
        }
      }

      userState.address = address
      balanceSync.start(address)
      userState.displayName = await displayNameStore.fetch(address)
    } else {
      // No address -> reset store and sign out
      if (userState.authenticated) await logout()

      userState.address = undefined
      userState.authenticated = undefined
      userState.balance = 0n
      userState.balanceFetched = false
      userState.displayName = undefined
    }
  }

  return {
    get address() {
      return userState.address
    },
    get displayName() {
      return userState.displayName
    },
    get balance() {
      return userState.balance
    },
    get balanceEth() {
      return formatSigFig(Number(formatEther(userState.balance)), 2)
    },
    get balanceUsd() {
      return formatAsDollar(Number(formatEther(userState.balance)) * prices.eth)
    },
    get authenticated() {
      return userState.authenticated
    },
    set authenticated(authenticated: EvmAddress | undefined) {
      userState.authenticated = authenticated
    },
    get balanceFetched() {
      return userState.balanceFetched
    },

    updateDisplayName: async (displayName: string) => {
      if (!userState.authenticated || !userState.address) {
        console.error("Cannot update display name: not authenticated")
        return
      }

      userState.displayName = await updateDisplayName(displayName)
      displayNameStore.set(userState.address, displayName)
    },

    changeWallet: async (wallet: Wallet | null) => {
      await handleWalletChange(wallet)
    },
  }
})()

async function updateDisplayName(displayName: string) {
  try {
    const response = await fetch("/api/display-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    })

    if (response.status === 409) throw new Error("Display name already taken")
    if (!response.ok) throw new Error("Failed to set display name")

    const data = await response.json()
    return data.displayName as string
  } catch (error) {
    console.error("Error setting display name:", error)
    return undefined
  }
}
