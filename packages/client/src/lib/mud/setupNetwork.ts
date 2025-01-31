import {
  createPublicClient,
  type Hex,
  type WalletClient,
  type Transport,
  type Account,
  type Chain,
  type PublicClient,
  getContract,
} from "viem"

import { syncToRecs } from "@latticexyz/store-sync/recs"
import { networkConfig } from "./networkConfig"
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json"
import { type ContractWrite } from "@latticexyz/common"
import { createWorld, type World } from "@latticexyz/recs"
import { Subject, share } from "rxjs"
import { transactionQueue, writeObserver } from "@latticexyz/common/actions"
import mudConfig from "contracts/mud.config"
import { browser } from "$app/environment"

export const world = createWorld()

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>
export type Components = SetupNetworkResult["components"]
export type Wallet = WalletClient<Transport, Chain, Account>

export const publicClient: PublicClient = createPublicClient({
  ...networkConfig,
  pollingInterval: 1000,
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
    indexerUrl:
      networkConfig.chainId === 8453
        ? window.location.origin
        : networkConfig.chainId === 84532
          ? "https://testnet-indexer.puzzlebets.xyz"
          : undefined,
  })

  /* if (networkConfig.faucetServiceUrl) {
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
  } */

  const MAX_RETRIES = 3

  return {
    world,
    components,
    publicClient,
    walletClient,
    latestBlock$,
    storedBlockLogs$,
    worldContract,
    write$: write$.asObservable().pipe(share()),
    waitForTransaction,
    stopSync,
  } as const
}
