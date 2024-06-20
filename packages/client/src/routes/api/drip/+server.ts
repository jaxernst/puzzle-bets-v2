import { publicClient } from "$lib/mud/setupNetwork"
import { dripClient } from "$lib/server/dripClient"
import { formatEther, isAddress, parseEther } from "viem"

// TODO: Add protection against abuse
// (Kinda curious to see how long it will take to get drained)

export const POST = async ({ locals }) => {
  const user = locals.user

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
