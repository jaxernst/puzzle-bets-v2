import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common"
import { derived, writable } from "svelte/store"
import { createWalletClient } from "viem"
import { networkConfig } from "./mud/networkConfig"
import { type Wallet } from "./mud/setupNetwork"

// cursed

export const chain = networkConfig.chain

export const walletStore = (() => {
  let wallet = $state<Wallet | undefined>()
  let connecting = $state(false)

  const connectBurner = () => {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey())
    const walletClient = createWalletClient({
      ...networkConfig,
      account: burnerAccount,
    }) as Wallet

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

    connect: async () => connectBurner(),
    disconnect: async () => {
      wallet = undefined
    },
  }
})()
