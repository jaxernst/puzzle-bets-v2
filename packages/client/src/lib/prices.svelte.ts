import { browser } from "$app/environment"
import { writable } from "svelte/store"

// Todo: Add sync to this

export const prices = (() => {
  let eth = $state(3500)

  if (browser) {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
      .then(async (r) => {
        eth = (await r.json()).USD
      })
      .catch(() => {})
  }

  return {
    get eth() {
      return eth
    },
  }
})()
