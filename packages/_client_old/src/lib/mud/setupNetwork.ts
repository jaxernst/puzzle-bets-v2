import {
  createPublicClient,
  type Hex,
  parseEther,
  type WalletClient,
  type Transport,
  type Account,
  type Chain,
  getContract,
} from "viem"

import { createFaucetService } from "@latticexyz/services/faucet"
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs"
import { networkConfig } from "./networkConfig"
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json"
import { type ContractWrite } from "@latticexyz/common"
import { createWorld } from "@latticexyz/recs"
import { Subject, share } from "rxjs"
import { track } from "@vercel/analytics"
import { transactionQueue, writeObserver } from "@latticexyz/common/actions"

export const world = createWorld()

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config"
import { browser } from "$app/environment"
import { type WaitForTransactionResult } from "@latticexyz/store-sync"

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>
export type Wallet = WalletClient<Transport, Chain, Account>

export const publicClient = createPublicClient({
  ...networkConfig,
  pollingInterval: 1000,
})

// Create a readonly instance of the world contract (for backend verifications)
export const worldContract = getContract({
  address: networkConfig.worldAddress as Hex,
  abi: IWorldAbi,
  client: {
    public: publicClient,
  },
})

export async function setupNetwork(wallet: Wallet) {
  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>()

  const walletClient = wallet
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }))

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  })

  /*
   * Sync on-chain state into RECS and keeps our client in sync.
   * Uses the MUD indexer if available, otherwise falls back
   * to the viem publicClient to make RPC calls to fetch MUD
   * events from the chain.
   */
  const {
    components,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    stopSync,
  } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
    // Only running an indexer on 4242 currently
    indexerUrl: browser ? window.location.origin : undefined,
  })

  if (networkConfig.faucetServiceUrl) {
    const address = walletClient.account.address
    console.info("[Dev Faucet]: Player address -> ", address)

    const faucet = createFaucetService(networkConfig.faucetServiceUrl)

    const requestDrip = async () => {
      const balance = await publicClient.getBalance({ address })
      console.info(`[Dev Faucet]: Player balance -> ${balance}`)
      const lowBalance = balance < parseEther(".1")
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player")

        track("drip_funds", { address })
        await faucet.dripDev({ address })
      }
    }

    requestDrip()
  }

  const MAX_RETRIES = 3

  const retryWaitForTransaction = async (
    tx: `0x${string}`,
    retries = 0,
  ): Promise<WaitForTransactionResult> => {
    try {
      return await waitForTransaction(tx)
    } catch (e) {
      if (retries < MAX_RETRIES) {
        console.log("Retrying wait for transaction")
        await new Promise((r) => setTimeout(r, 1500))
        return await retryWaitForTransaction(tx, retries + 1)
      }
      throw e
    }
  }

  return {
    world,
    components,
    playerEntity: encodeEntity(
      { address: "address" },
      { address: walletClient.account.address as `0x${string}` },
    ),
    publicClient,
    walletClient,
    latestBlock$,
    storedBlockLogs$,
    worldContract,
    write$: write$.asObservable().pipe(share()),
    waitForTransaction: retryWaitForTransaction,
    stopSync,
  }
}
