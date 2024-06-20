import { PUBLIC_VAPID_KEY } from "$env/static/public"
import type { EvmAddress } from "$lib/types"

export async function fetchNotificationState(address: string) {
  const res = await fetch(
    `/api/notifications/${address}/${await deviceHash()}/status`,
  )
  const { subscribed }: { subscribed: boolean } = await res.json()
  return subscribed
}

export async function deviceHash() {
  const dataString = navigator.userAgent
  const msgUint8 = new TextEncoder().encode(dataString)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function notificationPermissionGranted() {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission === "granted"
  }
  return false
}

export async function subscribeToPushNotifications() {
  const vapidKey = PUBLIC_VAPID_KEY
  if (!vapidKey) {
    throw new Error("VAPID key not found")
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error(
      "Browser doesn't support service workers or push notifications.",
    )
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    console.log("User is subscribed:", subscription)
    return subscription
  } catch (error) {
    console.error("Failed to subscribe the user: ", error)
    window.alert("Uh Oh! This browser doesn't support push notifications.")
  }
}

export const updatePushSubscription = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    // If serviceWorker or PushManager are not supported, throw an error or exit the function.
    console.error(
      "Browser doesn't support service workers or push notifications.",
    )
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    console.log("Updating subscription...")
    await fetch(`/api/notifications/_/${await deviceHash()}/update`, {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json",
      },
    })
  } catch (e) {
    console.log(e)
  }
}
