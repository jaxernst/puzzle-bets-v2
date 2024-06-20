import { DRIP_ACCOUNT_PRIVATE_KEY } from "$env/static/private"
import { networkConfig } from "$lib/mud/networkConfig"
import { createWalletClient } from "viem"
import { privateKeyToAccount } from "viem/accounts"

const dripAccount = privateKeyToAccount(
  DRIP_ACCOUNT_PRIVATE_KEY as `0x${string}`,
)

export const dripClient = createWalletClient({
  account: dripAccount,
  ...networkConfig,
})
