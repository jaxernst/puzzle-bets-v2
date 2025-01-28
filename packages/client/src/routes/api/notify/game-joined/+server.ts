import { sendFrameNotification } from "$lib/farcaster/notifs.server.js"
import { verifyGameParticipants } from "$lib/server/onchainChecks.js"
import { getFrameNotificationState } from "$lib/server/supabaseClient.js"
import type { EvmAddress } from "$lib/types.js"

export const POST = async ({ request, url, locals }) => {
  const { targetUser, gameId } = (await request.json()) as {
    targetUser: EvmAddress
    gameId: string
  }

  if (await verifyGameParticipants(Number(gameId), targetUser, locals.user)) {
    return new Response("Only game partipicant can notify opponent", {
      status: 401,
    })
  }

  const notificationState = await getFrameNotificationState(targetUser)
  if (!notificationState) {
    return new Response("User not registered for notifications", {
      status: 442,
    })
  }

  const res = await sendFrameNotification({
    title: "Opponent Joined!",
    body: "Your opponent has joined and started their turn, make your move!",
    notificationDetails: notificationState,
    url: `${url.origin}/game/wordle/${gameId}`,
  })

  if (res.state === "success") {
    return new Response(JSON.stringify(res), { status: 200 })
  } else {
    return new Response(JSON.stringify(res), { status: 500 })
  }
}
