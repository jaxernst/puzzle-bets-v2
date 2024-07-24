import { mud } from "./mudStore.svelte"
import { user } from "./userStore.svelte"
import {
  Has,
  HasValue,
  runQuery,
  getComponentValueStrict,
  getComponentValue,
  type Entity,
} from "@latticexyz/recs"
import {
  GameStatus,
  gameNumberToType,
  type EvmAddress,
  type Game,
} from "$lib/types"
import { encodeEntity } from "@latticexyz/store-sync/recs"
import { type SetupNetworkResult } from "./mud/setupNetwork"
import { PUBLIC_PUZZLE_MASTER_ADDRESS } from "$env/static/public"

export function getPlayerGames(
  player: EvmAddress | undefined,
  { synced, components: c }: typeof mud,
) {
  if (!player || !synced || !c) return []

  const p1Games = runQuery([
    Has(c.GameStatus),
    HasValue(c.Player1, { value: user.address }),
    HasValue(c.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
  ])

  const p2Games = runQuery([
    Has(c.GameStatus),
    HasValue(c.Player2, { value: user.address }),
    HasValue(c.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
  ])

  return Array.from([...p1Games, ...p2Games]).map((gameId) => {
    const game = gameIdToGame(gameId, c)

    return {
      ...game,
      ...playerFields(game, player),
      opponent: player === game.p1 ? game.p2 : game.p1,
    }
  })
}

export function getPublicGames() {
  return []
}

// Util //

export const gameIdToGame = (
  gameId: Entity,
  mudComponents: SetupNetworkResult["components"],
) => {
  const gameType =
    gameNumberToType[
      getComponentValueStrict(mudComponents.PuzzleType, gameId).value
    ]

  const p1 = getComponentValueStrict(mudComponents.Player1, gameId)
    .value as EvmAddress

  const p2 = getComponentValue(mudComponents.Player2, gameId)?.value as
    | EvmAddress
    | undefined

  const status = getComponentValueStrict(mudComponents.GameStatus, gameId)
    .value as GameStatus

  const buyInAmount =
    getComponentValue(mudComponents.BuyIn, gameId)?.value ?? 0n

  const submissionWindow = getComponentValueStrict(
    mudComponents.SubmissionWindow,
    gameId,
  ).value

  const inviteExpiration = getComponentValueStrict(
    mudComponents.InviteExpiration,
    gameId,
  ).value

  const p1GameKey = encodeEntity(
    { gameId: "bytes32", player: "address" },
    { gameId: gameId as `0x${string}`, player: p1 as `0x${string}` },
  )

  const p2GameKey =
    p2 &&
    encodeEntity(
      { gameId: "bytes32", player: "address" },
      { gameId: gameId as `0x${string}`, player: p2 as `0x${string}` },
    )

  const p1StartTime = getComponentValue(
    mudComponents.GamePlayerStartTime,
    p1GameKey,
  )?.value

  const p2StartTime =
    p2GameKey &&
    getComponentValue(mudComponents.GamePlayerStartTime, p2GameKey)?.value

  const p1Balance =
    getComponentValue(mudComponents.Balance, p1GameKey)?.value ?? 0n

  const p2Balance =
    (p2GameKey && getComponentValue(mudComponents.Balance, p2GameKey)?.value) ??
    0n

  const p1Rematch = getComponentValue(
    mudComponents.VoteRematch,
    p1GameKey,
  )?.value

  const p2Rematch =
    p2GameKey && getComponentValue(mudComponents.VoteRematch, p2GameKey)?.value

  const rematchCount =
    getComponentValue(mudComponents.RematchCount, gameId)?.value ?? 0

  return {
    id: gameId,
    type: gameType,
    status,
    p1,
    p2,
    buyInAmount,
    p1Balance,
    p2Balance,
    p1StartTime,
    p2StartTime,
    submissionWindow,
    inviteExpiration,
    p1Rematch,
    p2Rematch,
    rematchCount,
  }
}

export const playerFields = (game: Game, player: EvmAddress) => {
  const isP1 = game.p1 === player.toLowerCase()

  if (isP1) {
    return {
      myBalance: game.p1Balance,
      myStartTime: game.p1StartTime,
    }
  } else {
    return {
      myBalance: game.p2Balance,
      myStartTime: game.p2StartTime,
    }
  }
}
