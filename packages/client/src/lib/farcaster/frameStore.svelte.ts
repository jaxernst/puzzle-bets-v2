import { browser } from "$app/environment"
import type { FrameContext } from "@farcaster/frame-sdk"
import type { FrameSDK } from "@farcaster/frame-sdk/dist/types"

export const frameStore = (() => {
  let sdk = $state<FrameSDK | null>(null)
  let ctx = $state<FrameContext | null>(null)
  let initialized = $state(false)
  let unavailable = $state(false)

  return {
    /**
     * Initialize the frame sdk and set the user's display name to match their farcaster name (if not already set)
     */
    init: async () => {
      sdk = (await import("@farcaster/frame-sdk")).sdk

      ctx = await sdk.context
      if (!ctx) {
        unavailable = true
        return
      }

      sdk.actions.ready()
      console.log("frame ctx:", ctx)
      console.log("Frame launched!")
      initialized = true

      return ctx
    },

    get unavailable() {
      return unavailable
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

    addFrame: async () => {
      const res = await sdk!.actions?.addFrame()
      console.log("Frame added", res)
      if (res.added) {
        ctx!.client.added = true
        ctx!.client.notificationDetails = res.notificationDetails
      }
    },
  }
})()
