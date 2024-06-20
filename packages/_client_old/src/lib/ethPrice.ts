import { browser } from "$app/environment"
import { writable } from "svelte/store"

export const ethPrice = (() => {
  const { subscribe, set } = writable(3200)

  if (browser) {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
      .then(async (r) => {
        set((await r.json()).USD)
      })
      .catch(() => {})
  }

  return {
    subscribe,
  }
})()
