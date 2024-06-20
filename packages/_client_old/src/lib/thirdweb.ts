import { createThirdwebClient, defineChain } from "thirdweb"
import { PUBLIC_THIRDWEB_CLIENT_ID } from "$env/static/public"
import { createWallet, type Account as TwAccount } from "thirdweb/wallets"
import { viemAdapter } from "thirdweb/adapters/viem"
import { type Chain } from "viem"
import type { Wallet } from "$lib/mud/setupNetwork"

export const tw = createThirdwebClient({
  clientId: PUBLIC_THIRDWEB_CLIENT_ID,
})

export const twWallet = createWallet("embedded")

export async function connect(
  chain: Chain,
  authMethod: "auto" | "google" | "apple" | "email",
  payload?: { email: string; verificationCode: string },
) {
  let account: TwAccount
  if (authMethod === "auto") {
    account = await twWallet.autoConnect({ client: tw })
  } else if (authMethod !== "email") {
    account = await twWallet.connect({
      client: tw,
      strategy: authMethod,
    })
  } else {
    if (!payload) throw new Error("Payload required for email auth")

    account = await twWallet.connect({
      client: tw,
      strategy: "email",
      email: payload.email,
      verificationCode: payload.verificationCode,
    })
  }

  const walletClient = viemAdapter.walletClient.toViem({
    client: tw,
    account,
    chain: defineChain(chain as any),
  }) as Wallet

  walletClient.signMessage = account.signMessage

  return walletClient
}

export async function disconnect() {
  await twWallet.disconnect()
}
