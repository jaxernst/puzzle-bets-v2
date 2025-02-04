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
    domain: "beta.puzzlebets.xyz",
    uri: window.location.origin,
    version: "1",
  })

  const signature = await signMessage(wagmiConfig, { message })

  const result = await fetch("/api/siwe-auth/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  })

  nonce = null
  return result.ok
}
