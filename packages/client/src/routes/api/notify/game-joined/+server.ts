import { sendFrameNotification } from "$lib/farcaster/notifs.server.js"
import { getFrameNotificationState } from "$lib/server/supabaseClient.js"
import type { EvmAddress } from "$lib/types.js"

export const POST = async ({ request }) => {
  const { targetUser } = (await request.json()) as { targetUser: EvmAddress }

  const notificationState = await getFrameNotificationState(targetUser)
  if (!notificationState) {
    return new Response("User not registered for notifications", {
      status: 442,
    })
  }

  const res = await sendFrameNotification({
    title: "Opponent Joined",
    body: "Your opponent has joined and started their turn, make your move!",
    notificationDetails: notificationState,
  })

  if (res.state === "success") {
    return new Response(JSON.stringify(res), { status: 200 })
  } else {
    return new Response(JSON.stringify(res), { status: 500 })
  }
}
