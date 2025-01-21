import { mud } from "./mudStore.svelte"
import {
  Has,
  HasValue,
  runQuery,
  getComponentValueStrict,
  getComponentValue,
  type Entity,
  Not,
  NotValue,
} from "@latticexyz/recs"
import {
  GameStatus,
  gameNumberToType,
  type EvmAddress,
  type Game,
  type PlayerGame,
} from "$lib/types"
import { encodeEntity } from "@latticexyz/store-sync/recs"
import { type SetupNetworkResult } from "./mud/setupNetwork"
import { systemTimestamp, timeRemaining } from "$lib/util"

// @ts-ignore
import { PUBLIC_PUZZLE_MASTER_ADDRESS } from "$env/static/public"

export function getPlayerGames(
  player: EvmAddress | undefined,
  { synced, components: c }: typeof mud,
) {
  if (!player || !synced || !c) return []

  const p1Games = runQuery([
    Has(c.GameStatus),
    HasValue(c.Player1, { value: player }),
    HasValue(c.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
  ])

  const p2Games = runQuery([
    Has(c.GameStatus),
    HasValue(c.Player2, { value: player }),
    HasValue(c.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
  ])

  return Array.from(new Set([...p1Games, ...p2Games])).map((gameId) => {
    const game = gameIdToGame(gameId, c)

    return {
      ...game,
      ...playerFields(game, player),
      opponent: player === game.p1 ? game.p2 : game.p1,
    }
  })
}

export function getActivePlayerGames(
  player: EvmAddress | undefined,
  { synced, components: c }: typeof mud,
) {
  if (!player || !synced || !c) return []

  const p1Games = runQuery([
    HasValue(c.Player1, { value: player }),
    HasValue(c.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
    NotValue(c.GameStatus, { value: GameStatus.Inactive }),
    NotValue(c.GameStatus, { value: GameStatus.Complete }),
  ])

  const p2Games = runQuery([
    HasValue(c.Player2, { value: player }),
    HasValue(c.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
    NotValue(c.GameStatus, { value: GameStatus.Inactive }),
    NotValue(c.GameStatus, { value: GameStatus.Complete }),
  ])

  // Enure there are no duplicate game ids from the union of p1 and p2 games
  return Array.from(new Set([...p1Games, ...p2Games])).map((gameId) => {
    const game = gameIdToGame(gameId, c)
    return {
      ...game,
      ...playerFields(game, player),
      opponent: player === game.p1 ? game.p2 : game.p1,
    }
  })
}

export function getPublicGames({ synced, components: c }: typeof mud) {
  if (!c || !synced) return []

  const publicGames = runQuery([
    HasValue(c.GameStatus, { value: GameStatus.Pending }),
    HasValue(c.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
    Not(c.GamePasswordHash),
  ])

  const now = systemTimestamp()

  return Array.from([...publicGames])
    .map((gameId) => {
      return {
        ...gameIdToGame(gameId, c!),
        public: true,
      }
    })
    .filter((game) => Number(game.inviteExpiration) > now)
}

export function isGamePlayer(
  player: EvmAddress,
  gameId: Entity,
  { components: c, synced }: typeof mud,
) {
  if (!synced || !c) return
  const p1 = getComponentValue(c.Player1, gameId)?.value
  const p2 = getComponentValue(c.Player2, gameId)?.value

  return p1 === player || p2 === player
}

export function getPlayerSolutionState(
  player: EvmAddress,
  gameId: Entity,
  { synced, components: c }: typeof mud,
) {
  if (!synced || !c) {
    return { submitted: false, score: 0 }
  }

  const userGameKey = encodeEntity(
    { gameId: "bytes32", player: "address" },
    { gameId: gameId as `0x${string}`, player: player },
  )

  const submitted = getComponentValue(c.Submitted, userGameKey)
  const score = getComponentValue(c.Score, userGameKey)

  return {
    submitted: submitted?.value ?? false,
    score: score?.value ?? 0,
  }
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

  const status = getComponentValueStrict(mudComponents.GameStatus, gameId).value

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

  const playbackWindow = getComponentValueStrict(
    mudComponents.PlaybackWindow,
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

  const p1Score = getComponentValue(mudComponents.Score, p1GameKey)?.value ?? 0

  const p2Score =
    (p2GameKey && getComponentValue(mudComponents.Score, p2GameKey)?.value) ?? 0

  const p1Submitted =
    getComponentValue(mudComponents.Submitted, p1GameKey)?.value ?? false

  const p2Submitted =
    (p2GameKey &&
      getComponentValue(mudComponents.Submitted, p2GameKey)?.value) ??
    false

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
    p1Score,
    p2Score,
    p1Submitted,
    p2Submitted,
    submissionWindow,
    inviteExpiration,
    playbackWindow,
    p1Rematch,
    p2Rematch,
    rematchCount,
  }
}

export const playerFields = (game: Game, player: EvmAddress) => {
  const isP1 = game.p1.toLowerCase() === player.toLowerCase()

  if (isP1) {
    return {
      myBalance: game.p1Balance,
      myStartTime: game.p1StartTime,
      myScore: game.p1Score,
      myRematchVote: game.p1Rematch,
      iSubmitted: game.p1Submitted,
      opponent: game.p2,
      opponentBalance: game.p2Balance,
      opponentStartTime: game.p2StartTime,
      opponentScore: game.p2Score,
      opponentRematchVote: game.p2Rematch,
      opponentSubmitted: game.p2Submitted,
    }
  } else {
    return {
      myBalance: game.p2Balance,
      myStartTime: game.p2StartTime,
      myScore: game.p2Score,
      myRematchVote: game.p2Rematch,
      iSubmitted: game.p2Submitted,
      opponent: game.p1,
      opponentBalance: game.p1Balance,
      opponentStartTime: game.p1StartTime,
      opponentScore: game.p1Score,
      opponentRematchVote: game.p1Rematch,
      opponentSubmitted: game.p1Submitted,
    }
  }
}

export function getPlayerOutcomes(game: PlayerGame) {
  const now = systemTimestamp()

  const {
    mySubmissionTimeLeft,
    myPlaybackTime,
    opponentSubmissionTimeRemaining,
    opponentPlaybackTime,
  } = getGameTimers(game)

  const opponentMissedPlaybackWindow =
    game.myStartTime &&
    !game.opponentStartTime &&
    Number(game.myStartTime) + game.playbackWindow <= now

  // Determine if the current player is player 1 (starting player)
  const isPlayer1 = game.opponent === game.p2

  // Calculate if player 1 missed the playback window
  const iMissedPlaybackWindow =
    isPlayer1 &&
    game.opponentStartTime &&
    Number(game.opponentStartTime) + game.playbackWindow <= now &&
    !game.myStartTime

  const gameOver = calculateGameOver(
    game,
    mySubmissionTimeLeft,
    opponentSubmissionTimeRemaining,
    Boolean(opponentMissedPlaybackWindow),
    Boolean(iMissedPlaybackWindow),
  )
  const gameOutcome = calculateGameOutcome(
    game,
    gameOver,
    Boolean(opponentMissedPlaybackWindow),
    Boolean(iMissedPlaybackWindow),
  )

  const canViewResults =
    gameOver ||
    game.iSubmitted ||
    mySubmissionTimeLeft === 0 ||
    game.status === GameStatus.Complete

  return {
    mySubmissionTimeLeft,
    myPlaybackTime,
    opponentSubmissionTimeRemaining,
    opponentPlaybackTime,
    opponentMissedPlaybackWindow,
    iMissedPlaybackWindow,
    gameOver,
    gameOutcome,
    canViewResults,
    claimed: calculateClaimed(game, gameOutcome),
    opponentClaimed: calculateOpponentClaimed(game, gameOutcome),
    canSubmit: calculateCanSubmit(game, mySubmissionTimeLeft),
    waitingForOpponentPlayback: calculateWaitingForOpponentPlayback(
      game,
      mySubmissionTimeLeft,
    ),
  }
}

export function getGameTimers(game: PlayerGame) {
  const mySubmissionTimeLeft = game.myStartTime
    ? timeRemaining(Number(game.myStartTime) + game.submissionWindow)
    : -1

  const opponentSubmissionTimeRemaining = game.opponentStartTime
    ? timeRemaining(Number(game.opponentStartTime) + game.submissionWindow)
    : -1

  const opponentPlaybackTime =
    game.opponent === game.p1 && game.myStartTime && !game.opponentStartTime
      ? timeRemaining(Number(game.myStartTime) + game.playbackWindow)
      : -1

  const myPlaybackTime =
    game.opponent === game.p2 && !game.myStartTime && game.opponentStartTime
      ? timeRemaining(Number(game.opponentStartTime) + game.playbackWindow)
      : -1

  const inviteTimeLeft = game.inviteExpiration
    ? timeRemaining(Number(game.inviteExpiration))
    : -1

  return {
    mySubmissionTimeLeft,
    myPlaybackTime,
    opponentSubmissionTimeRemaining,
    opponentPlaybackTime,
    inviteTimeLeft,
  }
}

/**
 * Investigate:
 * - I join a game, run out of time without submitting
 * - Opponent joins game, then solves the puzzle
 * - Opponent should be able to claim before their time runs out no?
 * - I just tested this, and got a 'cannot claim' revert
 *    - Currently ui doesn't allow this
 *    - Double check the SCs for a mistake
 */

function calculateGameOver(
  game: PlayerGame,
  mySubmissionTimeLeft: number,
  opponentSubmissionTimeRemaining: number,
  opponentMissedPlaybackWindow: boolean,
  iMissedPlaybackWindow: boolean,
): boolean {
  if (opponentMissedPlaybackWindow || iMissedPlaybackWindow) return true
  if (!game.myStartTime || !game.opponentStartTime) return false
  if (game.status === GameStatus.Complete) return true
  if (game.iSubmitted && game.opponentSubmitted) return true
  if (mySubmissionTimeLeft === 0 && opponentSubmissionTimeRemaining === 0) {
    return true
  }

  return false
}

function calculateGameOutcome(
  game: PlayerGame,
  gameOver: boolean,
  opponentMissedPlaybackWindow: boolean,
  iMissedPlaybackWindow: boolean,
): "win" | "lose" | "tie" | null {
  if (!gameOver) return null
  if (iMissedPlaybackWindow) return "lose"
  if (
    (game.myScore ?? 0) > (game.opponentScore ?? 0) ||
    opponentMissedPlaybackWindow
  )
    return "win"
  if ((game.myScore ?? 0) < (game.opponentScore ?? 0)) return "lose"
  return "tie"
}

function calculateClaimed(
  game: PlayerGame,
  gameOutcome: "win" | "lose" | "tie" | null,
): boolean {
  if (game.buyInAmount > 0n && game.myBalance === 0n) return true
  if (gameOutcome === "win" && game.status === GameStatus.Complete) return true
  return false
}

function calculateOpponentClaimed(
  game: PlayerGame,
  gameOutcome: "win" | "lose" | "tie" | null,
): boolean {
  if (game.buyInAmount > 0n && game.opponentBalance === 0n) return true
  if (gameOutcome === "lose" && game.status === GameStatus.Complete) return true
  return false
}

function calculateCanSubmit(
  game: PlayerGame,
  mySubmissionTimeLeft: number,
): boolean {
  return (
    game.status === GameStatus.Active &&
    Boolean(game.myStartTime) &&
    mySubmissionTimeLeft > 0 &&
    !game.iSubmitted
  )
}

function calculateWaitingForOpponentPlayback(
  game: PlayerGame,
  mySubmissionTimeLeft: number,
): boolean {
  return Boolean(
    game.myStartTime &&
      !game.opponentStartTime &&
      (mySubmissionTimeLeft === 0 || game.iSubmitted),
  )
}
