import {
  displayNameStore,
  updateDisplayName,
} from "$lib/displayNameStore.svelte"
import { user } from "$lib/userStore.svelte"
import { browser } from "$app/environment"
import type { FrameContext } from "@farcaster/frame-sdk"
import type { FrameSDK } from "@farcaster/frame-sdk/dist/types"

export const frameStore = (() => {
  let sdk = $state<FrameSDK | null>(null)
  let ctx = $state<FrameContext | null>(null)
  let initialized = $state(false)

  return {
    /**
     * Initialize the frame sdk and set the user's display name to match their farcaster name (if not already set)
     */
    init: async () => {
      if (!browser) return

      sdk = (await import("@farcaster/frame-sdk")).sdk
      ctx = await sdk.context
      console.log("frame ctx:", ctx)

      if (!ctx) return

      if (user.authenticated) {
        const fcName = ctx.user.displayName || ctx.user.username
        const pbName = await displayNameStore.fetch(user.authenticated)

        if (!pbName && fcName) {
          updateDisplayName(user.authenticated, fcName)
        }
      }

      await sdk.actions.ready()
      console.log("Frame launched!")
      initialized = true
    },

    get actions() {
      return sdk?.actions
    },

    get context() {
      return ctx
    },

    get initialized() {
      return initialized
    },
  }
})()
