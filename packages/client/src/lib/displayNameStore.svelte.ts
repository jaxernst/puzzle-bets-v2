import type { EvmAddress } from "$lib"
import { Map } from "svelte/reactivity"

export const displayNameStore = (() => {
  let store = $state(new Map<EvmAddress, string>())

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
    get: (user: EvmAddress, fallback: boolean = true) => {
      const name = store.get(user)
      if (name) return name

      fetchName(user)

      return fallback ? user : undefined
    },
    set: (user: EvmAddress, displayName: string) => {
      store.set(user, displayName)
    },

    fetch: fetchName,
  }
})()
