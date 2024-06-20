import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common"
import { derived, writable } from "svelte/store"
import { createWalletClient } from "viem"
import { networkConfig } from "./mud/networkConfig"
import { type Wallet } from "./mud/setupNetwork"
import {
  connect as connectThirdweb,
  disconnect as disconnectThirdweb,
} from "./thirdweb"

export const chain = networkConfig.chain

export const walletStore = (() => {
  const wallet = writable<Wallet | undefined>()
  const connecting = writable(false)

  const connect = async (
    authMethod: "auto" | "google" | "apple" | "email",
    payload?: { email: string; verificationCode: string },
  ) => {
    const forcedDisconnect = Boolean(
      localStorage.getItem("wallet-force-disconnect"),
    )

    if (authMethod == "auto" && forcedDisconnect) {
      console.warn("Auto connect not allowed")
      return
    }

    const _wallet = await connectThirdweb(
      networkConfig.chain,
      authMethod,
      payload,
    )

    wallet.set(_wallet)

    // Reset forced disconnect state
    if (authMethod !== "auto" && forcedDisconnect) {
      localStorage.removeItem("wallet-force-disconnect")
    }

    return _wallet
  }

  const connectBurner = () => {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey())
    const walletClient = createWalletClient({
      ...networkConfig,
      account: burnerAccount,
    }) as Wallet

    wallet.set(walletClient)
    return walletClient
  }

  const { subscribe } = derived(
    [wallet, connecting],
    ([$wallet, $connecting]) => ({
      ...$wallet,
      connecting: $connecting,
    }),
  )

  return {
    subscribe,
    tryConnectBurner: async () => connectBurner(),
    tryConnect: async (
      method: "auto" | "google" | "apple" | "email",
      payload?: { email: string; verificationCode: string },
    ): Promise<Wallet | undefined> => {
      // Kinda hacky, but don't want the loading spinners to show when loading the page
      // with an auto connect in progress
      if (method !== "auto") {
        connecting.set(true)
      }

      try {
        return await connect(method, payload)
      } finally {
        connecting.set(false)
      }
    },
    disconnect: async () => {
      await disconnectThirdweb()

      fetch("/api/siwe-auth/logout", { method: "POST" })

      // Prevent from auto reconnecting
      localStorage.setItem("wallet-force-disconnect", "true")

      wallet.set(undefined)
    },
  }
})()
