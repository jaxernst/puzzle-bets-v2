import { PUBLIC_CHAIN_ID } from "$env/static/public"
import type { Components } from "./mud/setupNetwork"
import { type Component } from "@latticexyz/recs"
import { mount as mountDevTools } from "@latticexyz/dev-tools"

import { setupNetwork, type Wallet } from "$lib/mud/setupNetwork"
import { createSystemCalls } from "$lib/mud/createSystemCalls"

export const mud = (function createMudStore() {
  let mudState = $state<
    | { synced: false }
    | {
        synced: true
        components: Components
        systemCalls: ReturnType<typeof createSystemCalls>
      }
  >({ synced: false })

  // Tick value updated every second to force re-renders
  // (used for auto-updating game timers)
  let tick = $state(0)

  let stop = () => {}

  async function setup(wallet: Wallet) {
    const network = await setupNetwork(wallet)
    await waitForSync(network.components)

    PUBLIC_CHAIN_ID === 31337 && mountDevTools(network as any)

    mudState = {
      synced: true,
      components: network.components,
      systemCalls: createSystemCalls(network),
    }

    /**
     * Subscribe to component updates and propgate those changes to the mud store
     */
    const componentSubscriptions = Object.entries(network.components).map(
      ([componentName, component]) => {
        return (component as Component).update$.subscribe((update) => {
          if ("components" in mudState) {
            mudState = {
              ...mudState,
              components: {
                ...mudState.components,
                [componentName]: update.component,
              } as Components,
            }
          }
        })
      },
    )

    const timer = setInterval(() => {
      tick = tick + 1
    }, 1000)

    stop = () => {
      network.stopSync()
      clearInterval(timer)

      componentSubscriptions.forEach((subscription) =>
        subscription.unsubscribe(),
      )

      mudState = { synced: false }
    }
  }

  return {
    get components() {
      if (tick && mudState.synced) {
        return mudState.components
      }
    },

    get systemCalls() {
      if (mudState.synced) {
        return mudState.systemCalls
      }
    },

    get synced() {
      return mudState.synced
    },

    setup,
    stop,
  }
})()

async function waitForSync(components: Components) {
  return new Promise((resolve) => {
    components.SyncProgress.update$.subscribe((update) => {
      if (update.value[0]?.step === "live") {
        resolve(true)
      }
    })
  })
}
