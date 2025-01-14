import { sendFrameNotification } from "$lib/farcaster/notifs.server"
import {
  getAssociatedAddresses,
  updateFrameNotificationState,
} from "$lib/server/supabaseClient"
import {
  parseWebhookEvent,
  type ParseWebhookEvent,
} from "@farcaster/frame-node"
import type { RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ request }) => {
  const requestJson = await request.json()

  let data
  try {
    // Mock the app key verification. This allows notificaiton subscriptions to be spoofed, but we don't really care
    // about that for our notification use case
    data = await parseWebhookEvent(requestJson, async () => ({
      valid: true,
      appFid: 0,
    }))
  } catch (e: unknown) {
    const error = e as ParseWebhookEvent.ErrorType

    switch (error.name) {
      case "VerifyJsonFarcasterSignature.InvalidDataError":
      case "VerifyJsonFarcasterSignature.InvalidEventDataError":
        // The request data is invalid
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 400 },
        )
      case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
        // The app key is invalid
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 401 },
        )
      case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
        // Internal error verifying the app key (caller may want to try again)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500 },
        )
    }
  }

  const fid = data.fid
  const event = data.event

  // Look up the addresses associated with this FID
  const addresses = await getAssociatedAddresses(fid)

  switch (event.event) {
    case "frame_added":
      if (event.notificationDetails) {
        await updateFrameNotificationState(addresses, event.notificationDetails)
        await sendFrameNotification({
          title: "Welcome to Puzzle Bets!",
          body: "You'll receive status updates about your games here",
          notificationDetails: event.notificationDetails,
        })
      } else {
        await updateFrameNotificationState(addresses, null)
      }

      break
    case "frame_removed":
      await updateFrameNotificationState(addresses, null)

      break
    case "notifications_enabled":
      await updateFrameNotificationState(addresses, event.notificationDetails)

      break
    case "notifications_disabled":
      await updateFrameNotificationState(addresses, null)

      break
  }

  return new Response("ok")
}
