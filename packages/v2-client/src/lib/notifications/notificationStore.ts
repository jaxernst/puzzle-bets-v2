import type { EvmAddress } from "$lib/types"
import { derived, writable, type Readable } from "svelte/store"
import {
  deviceHash,
  fetchNotificationState,
  notificationPermissionGranted,
  subscribeToPushNotifications,
  updatePushSubscription,
} from "./notificationUtil"
import { user } from "$lib/user"

export const notifications = (() => {
  const enabledBackend = writable<boolean>()
  const enabledClient = writable<boolean>(notificationPermissionGranted())
  const enabled = derived(
    [enabledBackend, enabledClient],
    ([$enabledBackend, $enabledClient]) => {
      return $enabledBackend && $enabledClient
    },
  )

  const loading = writable(false)
  let subscriptionRefreshed = false

  // Auto fetch notification status once an account is available
  user.subscribe(async ($user) => {
    if (!$user.address) return
    const enabled = await fetchNotificationState($user.address)
    enabledBackend.set(enabled)

    // Push subscriptions need to be resubscribed to to keep them active, do this once
    if (enabled && !subscriptionRefreshed && notificationPermissionGranted()) {
      subscriptionRefreshed = true
      updatePushSubscription()
    }
  })

  const toggleNotifications = derived(
    [user, enabledBackend, enabledClient],
    ([$user, $enabledBackend, $enabledClient]) => {
      const toggle = async () => {
        if (!$user.address) return

        const deviceId = await deviceHash()

        if ($enabledBackend && $enabledClient) {
          const res = await fetch(
            `/api/notifications/${$user.address}/${deviceId}/unsubscribe`,
            {
              method: "POST",
            },
          )

          res.ok && enabledBackend.set(false)
        } else {
          // Get subscription object from the browser web-push api
          const subscription = await subscribeToPushNotifications()
          if (!subscription) return

          enabledClient.set(notificationPermissionGranted())

          if (!$enabledBackend) {
            const res = await fetch(
              `/api/notifications/${$user.address}/${deviceId}/subscribe`,
              {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: {
                  "content-type": "application/json",
                },
              },
            )

            res.ok && enabledBackend.set(true)
          }
        }
      }

      return async () => {
        loading.set(true)
        try {
          await toggle()
        } finally {
          loading.set(false)
        }
      }
    },
  ) as Readable<() => Promise<void>>

  return derived(
    [enabled, toggleNotifications, loading],
    ([enabled, toggle, loading]) => {
      return {
        enabled,
        loading,
        toggle,
      }
    },
  )
})()
