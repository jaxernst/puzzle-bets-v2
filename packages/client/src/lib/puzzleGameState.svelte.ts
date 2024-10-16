import { user } from "$lib/userStore.svelte"
import { mud } from "./mudStore.svelte"
import type { EvmAddress, PuzzleType } from "$lib/types"
import { entityToInt } from "$lib/util"
import { Map } from "svelte/reactivity"
import { gameIdToGame } from "./gameQueries"
import type { Entity } from "@latticexyz/recs"

export interface PuzzleState {
  solved: boolean
  lost: boolean
}

export interface WordleGameState extends PuzzleState {
  guesses: string[]
  answers: string[]
  answer: string | null
  badGuess: boolean
  resetCount?: number
}

type GameId = Entity | string

const emptyWordleState: WordleGameState = {
  answers: [],
  answer: null,
  guesses: [],
  badGuess: false,
  solved: false,
  lost: false,
}

export const wordleGameStates = (() => {
  const store = $state(new Map<GameId, WordleGameState>())

  let getOrCreateLoading = false
  const getOrCreate = async (
    gameId: GameId,
    isDemo: boolean,
    opponent?: EvmAddress,
  ) => {
    if (getOrCreateLoading) return

    getOrCreateLoading = true

    try {
      const gameIdParam =
        typeof gameId === "string" && gameId.startsWith("0x")
          ? entityToInt(gameId as Entity)
          : gameId

      const res = await fetch("/api/wordle/get-or-create-game", {
        method: "POST",
        body: JSON.stringify({ gameId: gameIdParam, opponent, isDemo }),
      })

      if (!res.ok) return

      const gameState = (await res.json()) as WordleGameState
      store.set(gameId, gameState!)
    } finally {
      getOrCreateLoading = false
    }
  }

  let guessEntering = false
  const enterGuess = async (gameId: GameId, guess: string, isDemo: boolean) => {
    if (guessEntering) return

    guessEntering = true
    try {
      const gameIdParam =
        typeof gameId === "string" && gameId.startsWith("0x")
          ? entityToInt(gameId as Entity)
          : gameId

      const res = await fetch("/api/wordle/submit-guess", {
        method: "POST",
        body: JSON.stringify({
          gameId: gameIdParam,
          guess,
          isDemo,
        }),
      })

      if (!res.ok) return

      const gameState = (await res.json()) as Omit<
        WordleGameState,
        "resetCount"
      >

      const resetCount = store.get(gameId)?.resetCount
      store.set(gameId, { ...gameState!, resetCount })
    } finally {
      guessEntering = false
    }
  }

  let resetLoading = false
  const reset = async (gameId: GameId, isDemo: boolean) => {
    if (resetLoading) return
    if (!mud.components && !isDemo) return

    const game = isDemo ? undefined : gameIdToGame(gameId, mud.components!)

    const opponent = game
      ? user.address === game.p1
        ? game.p2
        : game.p1
      : undefined

    const currentState = store.get(gameId)

    // Prevent resetting offchain puzzle state more than onchain rematch count
    if (game && (currentState?.resetCount ?? Infinity) >= game?.rematchCount) {
      return
    }

    resetLoading = true
    try {
      // Clear the current game state while maintaining reset count
      store.set(gameId, {
        ...emptyWordleState,
        resetCount: (currentState?.resetCount ?? 0) + 1,
      })

      const gameIdParam =
        typeof gameId === "string" && gameId.startsWith("0x")
          ? entityToInt(gameId as Entity)
          : gameId

      const res = await fetch("/api/wordle/reset-game", {
        method: "POST",
        body: JSON.stringify({
          gameId: gameIdParam,
          otherPlayer: opponent,
          isDemo,
        }),
      })

      // A reset can fail if the other player reset the game first, in this case,
      // we just fetch the game state again
      if (!res.ok) {
        getOrCreate(gameId, isDemo, opponent)
        return
      }

      const gameState = (await res.json()) as WordleGameState
      store.set(gameId, gameState)
    } finally {
      resetLoading = false
    }
  }

  return {
    get(gameId: GameId) {
      return store.get(gameId)
    },
    getOrCreate,
    enterGuess,
    reset,
  }
})()

export const puzzleStores = {
  wordle: wordleGameStates,
  connections: new Map(),
  crossword: new Map(),
  sudoku: new Map(),
} as const
