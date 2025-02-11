import { browser } from "$app/environment"
import { PUBLIC_CHAIN_ID } from "$env/static/public"
import type { EvmAddress } from "$lib/types"
import { createSiweMessage } from "viem/siwe"
import { wagmiConfig } from "./walletStore.svelte"
import { signMessage } from "@wagmi/core"
import { toastError } from "./toast"

let nonce: string | null = null

if (browser) {
  ;(async () => {
    nonce = await (
      await fetch("/api/siwe-auth/nonce", { credentials: "include" })
    ).text()
  })()
}

export async function signInWithEthereum(address: EvmAddress) {
  if (!nonce) {
    nonce = await (
      await fetch("/api/siwe-auth/nonce", { credentials: "include" })
    ).text()
  }

  const message = createSiweMessage({
    address,
    nonce,
    chainId: Number(PUBLIC_CHAIN_ID),
    domain: window.location.hostname,
    uri: window.location.origin,
    version: "1",
  })

  let signature: string
  try {
    signature = await signMessage(wagmiConfig, { message })
  } catch (error: any) {
    console.error("Error signing message", error)
    toastError(`Error signing message: ${error.shortMessage}`)
    return
  }

  const result = await fetch("/api/siwe-auth/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  })

  nonce = null
  return result.ok
}
