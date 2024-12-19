import { browser } from "$app/environment"
import { PUBLIC_CHAIN_ID } from "$env/static/public"
import type { EvmAddress } from "$lib/types"
import { getConnectors, signMessage } from "@wagmi/core"
import { createSiweMessage } from "viem/siwe"
import { wagmiConfig } from "./walletStore.svelte"

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
    domain: "puzzlebets.xyz",
    uri: window.location.origin,
    version: "1",
  })

  const signature = await signMessage(wagmiConfig, {
    message,
    connector: getConnectors(wagmiConfig)[0],
  })

  const result = await fetch("/api/siwe-auth/verify", {
    method: "POST",
    body: JSON.stringify({ message, signature }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })

  return result.ok
}
