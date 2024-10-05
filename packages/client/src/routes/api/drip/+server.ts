import { dripClient } from "$lib/server/dripClient.js"
import { getEthDripped, setEthDripped } from "$lib/server/supabaseClient"
import { isAddress, parseEther } from "viem"
import { networkConfig } from "$lib/mud/networkConfig.js"
import { waitForTransactionReceipt } from "viem/actions"

const VALID_DRIP_CHAINS = [84532]
const DRIP_LIMIT_ETH = 0.05
const DRIP_AMOUNT_ETH = 0.01

export const POST = async ({ locals }) => {
  const user = locals.user
  if (!user || !isAddress(user)) return new Response("No user", { status: 401 })

  if (
    !VALID_DRIP_CHAINS.includes(networkConfig.chainId) ||
    dripClient.chain.id !== networkConfig.chainId
  ) {
    return new Response("Drip not allowed on this network", { status: 400 })
  }

  const dripped = await getEthDripped(user)

  if (dripped >= DRIP_LIMIT_ETH) {
    return new Response("Drip limit reached", { status: 400 })
  }

  const tx = await dripClient.sendTransaction({
    data: "0x",
    value: parseEther(DRIP_AMOUNT_ETH.toString()),
  })

  const receipt = await waitForTransactionReceipt(dripClient, { hash: tx })

  if (receipt.status !== "success") {
    return new Response("Drip failed", { status: 400 })
  }

  await setEthDripped(user, dripped + DRIP_AMOUNT_ETH)

  return new Response("Dripped", { status: 200 })
}
