import { networkConfig } from "$lib/mud/networkConfig.js"
import { publicClient } from "$lib/mud/setupNetwork.js"
import { dripClient } from "$lib/server/dripClient.js"
import { formatEther, isAddress, parseEther } from "viem"
import { waitForTransactionReceipt } from "viem/actions"

export const POST = async ({ params }) => {
  const { user } = params

  if (!isAddress(user)) return new Response(null, { status: 403 })

  const balance = await publicClient.getBalance({ address: user })

  const etherAmount = formatEther(balance)
  console.log("Request Address has", etherAmount, "ether")

  // Pretty much 0
  if (Number(etherAmount) < 0.00001) {
    console.log("Sending", parseEther(".001"), "ether")
    const tx = await dripClient.sendTransaction({
      to: user,
      value: parseEther(".010"),
    })
    await publicClient.waitForTransactionReceipt({ hash: tx })
  }

  return new Response(null, { status: 200 })
}
