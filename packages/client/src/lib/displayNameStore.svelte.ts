import type { EvmAddress } from "$lib"
import { Map } from "svelte/reactivity"

export const displayNameStore = (() => {
  let store = $state(new Map())

  const fetchName = async (user: EvmAddress) => {
    try {
      const response = await fetch(`/api/display-name`)
      if (!response.ok) throw new Error("Failed to fetch display name")

      const { name: displayName } = await response.json()
      store.set(user, displayName)

      return displayName
    } catch (error) {
      console.error("Error fetching display name:", error)
    }
  }

  const setName = async (displayName: string) => {
    try {
      const response = await fetch("/api/display-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      })
      if (response.status === 409) {
        throw new Error("Display name already taken")
      }
      if (!response.ok) {
        throw new Error("Failed to set display name")
      }
      const data = await response.json()
      store.set(data.address, data.displayName)
      return data.displayName
    } catch (error) {
      console.error("Error setting display name:", error)
      throw error
    }
  }

  return {
    get: (user: EvmAddress, fallback: boolean = true) => {
      const name = store.get(user)
      if (name) return name

      fetchName(user)

      return fallback ? user : undefined
    },

    set: setName,
    fetch: fetchName,
  }
})()
