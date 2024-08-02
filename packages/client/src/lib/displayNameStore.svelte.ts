import type { EvmAddress } from "$lib"
import { Map } from "svelte/reactivity"

export const displayNameStore = (() => {
  let store = $state(new Map())

  const fetchName = async (user: EvmAddress) => {
    const names = ["Murph", "jaxernst", "w3sker"]
    const i = Math.floor(Math.random() * names.length)
    const name = names[i]

    setTimeout(() => {
      store.set(user, name)
    }, 100)
  }

  return {
    get: (user: EvmAddress, fallback: boolean = true) => {
      const name = store.get(user)
      if (name) return name

      fetchName(user)

      return fallback ? user : undefined
    },
  }
})()
