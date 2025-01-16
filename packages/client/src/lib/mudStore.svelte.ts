import type { Components } from "./mud/setupNetwork"
import { type Component } from "@latticexyz/recs"
import { setupNetwork, type Wallet } from "$lib/mud/setupNetwork"
import { createSystemCalls } from "$lib/mud/createSystemCalls"

type MudState =
  | { synced: false }
  | {
      synced: true
      components: Components
      systemCalls: ReturnType<typeof createSystemCalls>
    }

export const mud = (function createMudStore() {
  let mudState = $state<MudState>({ synced: false })
  let stop = $state(() => {})
  let tick = $state(1)

  async function setup(wallet: Wallet) {
    const network = await setupNetwork(wallet)
    console.log("Network setup complete, starting state sync", network)

    await waitForSync(network.components)

    mudState = {
      synced: true,
      components: network.components,
      systemCalls: createSystemCalls(network),
    }

    /**
     * Subscribe to component updates and propgate those changes to the mud store
     */
    const componentSubscriptions = subscribeToComponents(network.components, {
      onUpdate: (componentName, updatedComponent) => {
        if (!mudState.synced) return

        mudState = {
          ...mudState,
          components: {
            ...mudState.components,
            [componentName]: updatedComponent,
          } as Components,
        }
      },
    })

    const tickInterval = setInterval(() => {
      tick = tick + 1
    }, 1000)

    // Return cleanup function
    return () => {
      clearInterval(tickInterval)

      componentSubscriptions.forEach((subscription) =>
        subscription.unsubscribe(),
      )

      network.stopSync()
      mudState.synced = false
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

    setup: async (wallet: Wallet) => {
      stop = await setup(wallet)
    },

    get stop() {
      return stop
    },
  }
})()

async function waitForSync(components: Components) {
  return new Promise((resolve) => {
    components.SyncProgress.update$.subscribe((update) => {
      console.log("Sync Progress:", update.value[0]?.percentage, "%")

      if (update.value[0]?.step === "live") {
        resolve(true)
      }
    })
  })
}

function subscribeToComponents(
  components: Components,
  {
    onUpdate,
  }: { onUpdate: (componentName: string, updatedComponent: Component) => void },
) {
  return Object.entries(components).map(([componentName, component]) => {
    return (component as Component).update$.subscribe((update) => {
      onUpdate(componentName, update.component)
    })
  })
}
