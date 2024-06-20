import { sendPushNotification } from "$lib/notifications/webPush.server.js"
import { supabase } from "$lib/server/supabaseClient.js"
import { isAddress } from "viem"

export const POST = async ({ params }) => {
  const user = params.user
  if (!isAddress(user)) return new Response("No user", { status: 404 })

  const { data: subscriptions, error } = await supabase
    .from("notifications")
    .select("subscription")
    .eq("user_address", user)

  if (!subscriptions || subscriptions?.length === 0) {
    return new Response("No subscription", { status: 200 })
  }

  for (const { subscription } of subscriptions) {
    try {
      await sendPushNotification(
        "Puzzle Started!",
        "Your opponent has joined a game with you, solve the puzzle before time runs out",
        subscription as any,
      )
    } catch (e: any) {
      return new Response("Push failed", { status: e.status ?? 500 })
    }
  }

  return new Response(null, { status: 201 })
}
