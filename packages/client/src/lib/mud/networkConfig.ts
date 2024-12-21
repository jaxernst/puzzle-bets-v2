/*
 * Network specific configuration for the client.
 * By default connect to the anvil test network.
 */

/*
 * Import the addresses of the World, possibly on multiple chains,
 * from packages/contracts/worlds.json. When the contracts package
 * deploys a new `World`, it updates this file.
 */
import worlds from "contracts/worlds.json"

/*
 * The supported chains.
 * By default, there are only two chains here:
 *
 * - mudFoundry, the chain running on anvil that pnpm dev
 *   starts by default. It is similar to the viem anvil chain
 *   (see https://viem.sh/docs/clients/test.html), but with the
 *   basefee set to zero to avoid transaction fees.
 * - latticeTestnet, our public test network.
 *
 * See https://mud.dev/tutorials/minimal/deploy#run-the-user-interface
 * for instructions on how to add networks.
 */

// @ts-ignore
import { PUBLIC_CHAIN_ID } from "$env/static/public"

import { supportedChains } from "./supportedChains"
import { fallback, http } from "viem"
import { transportObserver } from "@latticexyz/common"
import type { MUDChain } from "@latticexyz/common/chains"

export const networkConfig = (() => {
  const params = new URLSearchParams("") // window.location.search);

  /*
   * The chain ID source:
   * 1. chainId/chainid query parameter
   * 2. The VITE_CHAIN_ID environment variable set when the
   *    vite dev server was started or client was built
   * 4. The default, 31337 (anvil)
   */
  const chainId = Number(
    params.get("chainId") || params.get("chainid") || PUBLIC_CHAIN_ID || 31337,
  )

  /*
   * Find the chain (unless it isn't in the list of supported chains).
   */
  const chainIndex = supportedChains.findIndex((c) => c.id === chainId)
  const chain = supportedChains[chainIndex]
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`)
  }

  /*
   * Get the address of the World. If you want to use a
   * different address than the one in worlds.json,
   * provide it as worldAddress in the query string.
   */
  const world = worlds[chain.id.toString()]
  const worldAddress = params.get("worldAddress") || world?.address
  if (!worldAddress) {
    throw new Error(
      `No world address found for chain ${chainId}. Did you run \`mud deploy\`?`,
    )
  }

  /*
   * MUD clients use events to synchronize the database, meaning
   * they need to look as far back as when the World was started.
   * The block number for the World start can be specified either
   * on the URL (as initialBlockNumber) or in the worlds.json
   * file. If neither has it, it starts at the first block, zero.
   */
  const initialBlockNumber = params.has("initialBlockNumber")
    ? Number(params.get("initialBlockNumber"))
    : world?.blockNumber ?? 0n

  return {
    chainId,
    chain,
    faucetServiceUrl: params.get("faucet") ?? (chain as MUDChain).faucetUrl,
    worldAddress,
    initialBlockNumber,
    transport: transportObserver(fallback([http()])),
  }
})()
