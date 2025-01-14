import type { EvmAddress } from "$lib"
import { SvelteMap as Map } from "svelte/reactivity"

export const displayNameStore = (() => {
  let store = $state(new Map<EvmAddress, string>())
  const pendingFetches = new Set<EvmAddress>()

  const fetchName = async (user: EvmAddress) => {
    try {
      const response = await fetch(`/api/display-name/${user}`)
      if (!response.ok) throw new Error("Failed to fetch display name")

      const { name: displayName } = await response.json()
      store.set(user, displayName)

      return displayName
    } catch (error) {
      console.error("Error fetching display name:", error)
    }
  }

  return {
    get all() {
      return store
    },

    get: (user: EvmAddress, fallback: boolean = true) => {
      const name = store.get(user)
      if (name) return name

      if (!pendingFetches.has(user)) {
        pendingFetches.add(user)
        fetchName(user).finally(() => {
          pendingFetches.delete(user)
        })
      }

      return fallback ? user : undefined
    },
    set: (user: EvmAddress, displayName: string | undefined) => {
      if (displayName === undefined) {
        store.delete(user)
      } else {
        store.set(user, displayName)
      }
    },

    fetch: fetchName,
  }
})()

export async function updateDisplayName(
  user: EvmAddress,
  displayName: string | null,
) {
  try {
    const response = await fetch("/api/display-name", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    })

    if (response.status === 409) throw new Error("Display name already taken")
    if (!response.ok) throw new Error("Failed to set display name")

    const data = await response.json()

    displayNameStore.set(user, displayName ?? undefined)
    return data.displayName as string
  } catch (error) {
    console.error("Error setting display name:", error)
    return undefined
  }
}
