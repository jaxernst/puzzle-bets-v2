import { derived, get, writable } from "svelte/store"
import { mud } from "./mudStore.svelte"
import { user } from "./userStore.svelte"
import {
  Has,
  HasValue,
  runQuery,
  getComponentValueStrict,
  getComponentValue,
  type Entity,
  Not,
  defineQuery,
} from "@latticexyz/recs"
import { GameStatus, gameNumberToType, type EvmAddress } from "$lib/types"
import { encodeEntity } from "@latticexyz/store-sync/recs"
import { world, type SetupNetworkResult } from "./mud/setupNetwork"
import { timeRemaining, intToEntity, systemTimestamp } from "./util"
import { PUBLIC_PUZZLE_MASTER_ADDRESS } from "$env/static/public"
import { networkConfig } from "./mud/networkConfig"
import { set } from "svelte/reactivity"

export const userGames = (forUser: EvmAddress) => {
  let games = $state([])

  const startSync = (c: SetupNetworkResult["components"]) => {
    defineQuery([
      Has(c.GameStatus),
      HasValue(c.Player1, { value: user.address }),
      HasValue(c.PuzzleMasterEoa, {
        value: PUBLIC_PUZZLE_MASTER_ADDRESS,
      }),
    ]).matching
  }

  return {}
}

/**
 * How this should work:
 * - We have the players games as a state rune
 * - The getter for the games will run the queries.
 *    (Want to avoid running these queries every time state is updated)
 */
export const userGames_ = $derived.by(() => {
  if (!mud.synced) return []

  const { GameStatus, Player1, PuzzleMasterEoa } = mud.components

  const p2Games = runQuery([
    Has(GameStatus),
    HasValue(Player2, { value: user.address }),
    HasValue(PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
  ])

  return Array.from([...p1Games, ...p2Games]).map((gameId) => {
    const game = gameIdToGame(gameId, $mud.components!)
    return {
      ...game,
      opponent: $user.address === game.p1 ? game.p2 : game.p1,
    }
  })
})

export const lobbyGames = derived(mud, ($mud) => {
  if (!$mud?.ready || !$mud.components) return []

  const publicGames = runQuery([
    HasValue($mud.components.GameStatus, { value: GameStatus.Pending }),
    HasValue($mud.components.PuzzleMasterEoa, {
      value: PUBLIC_PUZZLE_MASTER_ADDRESS,
    }),
    Not($mud.components.GamePasswordHash),
  ])

  const now = systemTimestamp()

  return Array.from([...publicGames])
    .map((gameId) => {
      return {
        ...gameIdToGame(gameId, $mud.components!),
        public: true,
      }
    })
    .filter((game) => Number(game.inviteExpiration) > now)
})

export const getGame = derived(mud, ($mud) => {
  return (gameId: Entity, opts?: { expectStarted?: boolean }) => {
    if (!$mud?.ready || !$mud.components) return undefined
    if (!getComponentValue($mud.components.PuzzleType, gameId)) return undefined

    const game = gameIdToGame(gameId, $mud.components)

    if (opts?.expectStarted && !game.startTime) {
      throw new Error("Game not started")
    }

    return game
  }
})

export const userSolvedGame = derived(mud, ($mud) => {
  return (gameId: Entity, user: EvmAddress | undefined) => {
    if (!$mud?.ready || !user || !$mud.components) {
      return { submitted: false, score: 0 }
    }

    const userGameKey = encodeEntity(
      { gameId: "bytes32", player: "address" },
      { gameId: gameId as `0x${string}`, player: user },
    )

    const submitted = getComponentValue($mud.components.Submitted, userGameKey)
    const score = getComponentValue($mud.components.Score, userGameKey)

    return {
      submitted: submitted?.value ?? false,
      score: score?.value ?? 0,
    }
  }
})

export type LiveStatus = {
  gameId: Entity
  status: GameStatus
  submissionTimeLeft?: number
  inviteTimeLeft?: number
}

/**
 * Get an auto-updating game status store with countdown timers for invite deadlines
 * and puzzle submission deadlines
 **/
export function liveGameStatus(gameId: Entity) {
  const store = writable<LiveStatus | null>(null)

  // Decrement timers and mark game as complete when time runs out
  const updateStatusTimers = (onGameFinalized: () => void) => {
    const components = get(mud).components
    if (!components) return

    const { inviteExpiration, startTime, submissionWindow } = gameIdToGame(
      gameId,
      components,
    )

    store.update((g) => {
      if (!g) return g

      if (g.status === GameStatus.Pending) {
        return { ...g, inviteTimeLeft: timeRemaining(inviteExpiration) }
      } else if (g.status === GameStatus.Active) {
        if (!startTime) return g

        const timeLeft = timeRemaining(Number(startTime) + submissionWindow)

        if (timeLeft === 0) {
          onGameFinalized()
          return { ...g, submissionTimeLeft: 0 }
        }

        return { ...g, submissionTimeLeft: timeLeft }
      } else if (g.status === GameStatus.Complete) {
        onGameFinalized()
      }

      return g
    })
  }

  let timersStarted = false
  let timer: NodeJS.Timeout

  const startTimers = () => {
    updateStatusTimers(() => {})

    timer = setInterval(() => {
      updateStatusTimers(() => {
        // On game finalized callback
        timersStarted = false
        clearInterval(timer)
      })
    }, 1000)

    timersStarted = true
  }

  let gameStartTime: bigint | null = null

  // Listen for status updates to the onchain game state
  mud.subscribe(($mud) => {
    if (!$mud?.ready || !$mud.components) return undefined

    const game = gameIdToGame(gameId, $mud.components)

    store.update((state) => {
      if (!state) {
        return {
          gameId,
          status: game.status,
          submissionTimeLeft: undefined,
          inviteTimeLeft: undefined,
        }
      } else {
        return { ...state, status: game.status }
      }
    })

    if (!timersStarted) {
      startTimers()
    }

    const gameStartTimeChanged =
      gameStartTime !== null && game.startTime !== gameStartTime

    // If the game start time changes (when a rematch occurs), reset timers
    if (gameStartTimeChanged && timersStarted) {
      clearInterval(timer)
      startTimers()
    }

    // Listen for a game rematch to occur. When it does, restart the timers
    gameStartTime = game.startTime ?? null
  })

  return store
}

export const userArchivedGames = (() => {
  const store = writable<Entity[]>([])

  user.subscribe(async ($user) => {
    if (!$user.address) return

    const res = await fetch(`/api/game-settings/archived`)
    if (res.ok) {
      const data = (await res.json()) as number[]
      store.set(data.map((g) => intToEntity(g, true)!))
    }
  })

  const setArchivedState = async (gameId: Entity, archiveState: boolean) => {
    const $user = get(user)
    if (!$user.address) return

    const res = await fetch(`/api/game-settings/update-archived`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: parseInt(gameId, 16),
        archived: archiveState,
      }),
    })

    if (res.ok) {
      store.update((games) => {
        if (archiveState) {
          return [...games, gameId]
        } else {
          return games.filter((g) => g !== gameId)
        }
      })
    }
  }

  return {
    ...store,
    setArchivedState,
  }
})()

// Util //

const gameIdToGame = (
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

  const startTime = getComponentValue(
    mudComponents.GameStartTime,
    gameId,
  )?.value

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
    startTime,
    submissionWindow,
    inviteExpiration,
    p1Rematch,
    p2Rematch,
    rematchCount,
  }
}
