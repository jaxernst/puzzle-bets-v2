import { PRIVATE_VAPID_KEY } from "$env/static/private"
import { PUBLIC_VAPID_KEY } from "$env/static/public"
import webpush from "web-push"

if (!PUBLIC_VAPID_KEY || !PRIVATE_VAPID_KEY) {
  throw new Error("Missing VAPID env variables for notifcation server")
}

webpush.setVapidDetails(
  "mailto:jaxernst@gmail.com",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY,
)

export const sendPushNotification = async (
  title: string,
  body: string,
  subscription: PushSubscription,
) => {
  try {
    await webpush.sendNotification(
      subscription as any,
      JSON.stringify({
        title,
        body,
      }),
    )
  } catch (e) {
    console.error("Error sending push notification", e)
    throw e
  }
}
