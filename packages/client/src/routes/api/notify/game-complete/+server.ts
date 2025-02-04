import type { EvmAddress } from "$lib"
import { verifyGameParticipants } from "$lib/server/onchainChecks"
import { getFrameNotificationState, supabase } from "$lib/server/supabaseClient"

export const POST = async ({ request, locals, url }) => {
  const { targetUser, gameId, delayMinutes } = (await request.json()) as {
    targetUser: EvmAddress
    gameId: string
    delayMinutes: number
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

  const notification = {
    title: "Game Complete!",
    body: "Your opponent has joined and started their turn, make your move!",
    notificationDetails: notificationState,
    url: `${url.origin}/game/wordle/${gameId}`,
  }

  const { error } = await supabase.schema("pgmq").rpc("send", {
    queue_name: "game_complete_notification_queue",
    msg: notification,
    delay: 0,
  })

  if (error) {
    console.error("Failed to schedule notification:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
      },
    )
  }

  return new Response(null, { status: 200 })
}
