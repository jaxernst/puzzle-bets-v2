import { worldContract } from "$lib/mud/setupNetwork"
import { resourceToHex } from "@latticexyz/common"
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs"
import { intToEntity } from "$lib/util"
import type { EvmAddress } from "$lib/types"

const Player1 = resourceToHex({
  type: "table",
  namespace: "v1",
  name: "Player1",
})

const Player2 = resourceToHex({
  type: "table",
  namespace: "v1",
  name: "Player2",
})

const RematchCount = resourceToHex({
  type: "table",
  namespace: "v1",
  name: "RematchCount",
})

export async function verifyGameParticipants(
  gameId: number,
  p1: EvmAddress,
  p2: EvmAddress,
) {
  const [p1Lookup, p2Lookup] = (await Promise.all([
    await worldContract.read.getField([
      Player1,
      entityToHexKeyTuple(intToEntity(gameId, true)),
      0,
    ]),

    await worldContract.read.getField([
      Player2,
      entityToHexKeyTuple(intToEntity(gameId, true)),
      0,
    ]),
  ])) as [string, string]

  const onchainPlayers = [p1Lookup, p2Lookup]

  return (
    onchainPlayers.includes(p1.toLowerCase()) &&
    onchainPlayers.includes(p2.toLowerCase())
  )
}

export async function getGameRematchCount(gameId: number) {
  const hexStr = await worldContract.read.getField([
    RematchCount,
    entityToHexKeyTuple(intToEntity(gameId, true)),
    0,
  ])

  return parseInt(hexStr, 16)
}
