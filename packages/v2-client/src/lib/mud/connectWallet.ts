import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common"
import { derived, writable } from "svelte/store"
import { createThirdwebClient, defineChain, getRpcClient } from "thirdweb"
import { PUBLIC_CHAIN_ID, PUBLIC_THIRDWEB_CLIENT_ID } from "$env/static/public"
import { createWallet, type Account as TwAccount } from "thirdweb/wallets"
import { viemAdapter } from "thirdweb/adapters/viem"
import { createWalletClient, type Chain } from "viem"
import { networkConfig } from "./networkConfig"
import { type Wallet } from "./setupNetwork"

export const tw = createThirdwebClient({
  clientId: PUBLIC_THIRDWEB_CLIENT_ID,
})

export const twWallet = createWallet("embedded")

export const chain = networkConfig.chain

export const walletStore = (() => {
  const wallet = writable<Wallet | undefined>()
  const connecting = writable(false)

  let disconnected = false

  const connect = async (authMethod: "auto" | "google" | "apple" | "email") => {
    const forcedDisconnect = Boolean(
      localStorage.getItem("wallet-force-disconnect"),
    )

    let account: TwAccount
    if (authMethod === "auto") {
      // Forbid autoconnect if use user had manually disconnected
      if (forcedDisconnect) throw new Error("Auto connect not allowed")

      account = await twWallet.autoConnect({ client: tw })
    } else if (authMethod !== "email") {
      account = await twWallet.connect({
        client: tw,
        strategy: authMethod,
      })
    } else {
      throw new Error("Email auth not yet supported")
    }

    if (forcedDisconnect) {
      localStorage.removeItem("wallet-force-disconnect")
    }

    const walletClient = viemAdapter.walletClient.toViem({
      client: tw,
      account: account,
      chain: defineChain(chain as any),
    }) as Wallet

    wallet.set(walletClient)
    return walletClient
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
    ): Promise<Wallet> => {
      connecting.set(true)
      try {
        return await connect(method)
      } finally {
        connecting.set(false)
      }
    },
    disconnect: () => {
      twWallet.disconnect()

      // Prevent from auto reconnecting
      localStorage.setItem("wallet-force-disconnect", "true")

      wallet.set(undefined)
    },
  }
})()
