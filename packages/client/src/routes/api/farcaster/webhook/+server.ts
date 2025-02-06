import { sendFrameNotification } from "$lib/farcaster/notifs.server"
import {
  getAssociatedAddresses,
  updateFrameNotificationState,
} from "$lib/server/supabaseClient"
import {
  createVerifyAppKeyWithHub,
  verifyAppKeyWithNeynar,
  parseWebhookEvent,
  type ParseWebhookEvent,
  type VerifyAppKey,
  type VerifyAppKeyResult,
} from "@farcaster/frame-node"
import type { RequestHandler } from "@sveltejs/kit"

const verifyAppKeyWithPinata: VerifyAppKey = async (
  fid: number,
  appKey: string,
): Promise<VerifyAppKeyResult> => {
  const verifier = createVerifyAppKeyWithHub("https://hub.pinata.cloud")
  console.log("verifier result", await verifier(fid, appKey))
  return verifier(fid, appKey)
}

export const POST: RequestHandler = async ({ request }) => {
  const requestJson = await request.json()

  let data
  try {
    // Mock the app key verification. This allows notification subscriptions to be spoofed, but we don't really care
    // about that for our notification use case
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithPinata)
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
          url: "https://puzzlebets.xyz/dashboard",
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
