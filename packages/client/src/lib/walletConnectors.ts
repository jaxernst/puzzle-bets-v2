import { browser, version } from "$app/environment"
import { coinbaseWallet } from "@wagmi/connectors"
import { injected, type Connector, type CreateConnectorFn } from "@wagmi/core"
import { frameStore } from "./farcaster/frameStore.svelte"

// TODO: Remove this (temporarily added for cbsw connector)
if (browser) window.process = { env: {}, version } as any

export const cbWalletConnector = coinbaseWallet({
  appName: "Puzzle Bets",
  preference: "smartWalletOnly",
})

export const injectedConnector = injected()

/**
 * @notice The Frame connector (currently) must be imported dynamically on client.
 * This means we need to pull some tricks to import a export the frame
 * connector:
 *
 * The frameConnector is initially assigned with a dummy connector so it
 * can be exported in the connectors array, but the assigment will be overwritten
 * with the real connector once the import resolves
 *
 * This may lead to race conditions but is currently the best solution I've found
 */
let frameConnector: CreateConnectorFn = () =>
  ({
    // Returns a dummy 'getProvider' function because wagmi's 'reconnect'
    // function will always try to call this immediately if included
    // in the connectors array
    getProvider: () => new Promise((_res, reject) => reject()),
  }) as Connector

if (browser) {
  import("./farcaster/farcasterFramesConnector").then(
    ({ frameConnector: createConnector }) => {
      frameConnector = createConnector()
    },
  )
}

export const connectors = [
  cbWalletConnector,
  injectedConnector,
  frameConnector,
] as const

export function getDefaultConnector() {
  if (!browser) throw new Error("Not in browser")
  if (frameStore.initialized) {
    return frameConnector
  }

  return injected()
}
