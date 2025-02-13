import { sendFrameNotification } from "$lib/farcaster/notifs.server.js"
import { verifyGameParticipants } from "$lib/server/onchainChecks.js"
import { getFrameNotificationState } from "$lib/server/supabaseClient.js"
import type { EvmAddress } from "$lib/types.js"

export const POST = async ({ request, url, locals }) => {
  const { targetUser, gameId } = (await request.json()) as {
    targetUser: EvmAddress
    gameId: string
  }

  const playersValid = await verifyGameParticipants(
    Number(gameId),
    targetUser,
    locals.user,
  )

  if (!playersValid) {
    return new Response("Only game partipicant can notify opponent", {
      status: 403,
    })
  }

  const notificationState = await getFrameNotificationState(targetUser)
  if (!notificationState) {
    return new Response("User not registered for notifications", {
      status: 412,
    })
  }

  const res = await sendFrameNotification({
    title: "Rematch Started!",
    body: "You and your opponent have voted to rematch, start your turn!",
    notificationDetails: notificationState,
    url: `${url.origin}/game/wordle/${gameId}`,
  })

  if (res.state === "success") {
    return new Response(JSON.stringify(res), { status: 200 })
  } else {
    return new Response(JSON.stringify(res), { status: 500 })
  }
}
