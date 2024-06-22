import { user } from "$lib/userStore.svelte"
import type { EvmAddress, PuzzleType } from "$lib/types"
import { intToEntity } from "$lib/util"

import { derived, get, writable, type Readable } from "svelte/store"

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

type GameId = string

const emptyWordleState: WordleGameState = {
  answers: [],
  answer: null,
  guesses: [],
  badGuess: false,
  solved: false,
  lost: false,
}

export const wordleGameStates = (() => {
  const store = writable<Map<GameId, WordleGameState>>(new Map())

  // Opponent is temporary, and will eventually be retrieved in the backend
  let getOrCreateLoading = false
  const getOrCreate = async (
    gameId: GameId,
    isDemo: boolean,
    opponent?: EvmAddress,
  ) => {
    if (getOrCreateLoading) return

    getOrCreateLoading = true

    try {
      const res = await fetch("/api/wordle/get-or-create-game", {
        method: "POST",
        body: JSON.stringify({ gameId, opponent, isDemo }),
      })

      if (!res.ok) return

      const gameState = (await res.json()) as WordleGameState
      store.update((s) => s.set(gameId, gameState!))
    } finally {
      getOrCreateLoading = false
    }
  }

  let guessEntering = false
  const enterGuess = async (gameId: GameId, guess: string, isDemo: boolean) => {
    if (guessEntering) return

    guessEntering = true
    try {
      const res = await fetch("/api/wordle/submit-guess", {
        method: "POST",
        body: JSON.stringify({
          guess,
          gameId,
          isDemo,
        }),
      })

      if (!res.ok) return

      const gameState = (await res.json()) as Omit<
        WordleGameState,
        "resetCount"
      >

      store.update((s) => {
        let resetCount = s.get(gameId)?.resetCount
        return s.set(gameId, { ...gameState!, resetCount })
      })
    } finally {
      guessEntering = false
    }
  }

  const getGame = (_: any) => undefined

  let resetLoading = false
  const reset = async (gameId: GameId, isDemo: boolean) => {
    if (resetLoading) return

    const game = isDemo ? undefined : getGame(intToEntity(gameId, true))
    const opponent = game
      ? user.address === game.p1
        ? game.p2
        : game.p1
      : undefined

    const currentState = get(store).get(gameId)

    // Prevent resetting offchain puzzle state more than onchain rematch count
    if (game && (currentState?.resetCount ?? Infinity) >= game?.rematchCount) {
      return
    }

    resetLoading = true
    try {
      // Clear the current game state while maintaining reset count
      store.update((s) =>
        s.set(gameId, {
          ...emptyWordleState,
          resetCount: (currentState?.resetCount ?? 0) + 1,
        }),
      )

      const res = await fetch("/api/wordle/reset-game", {
        method: "POST",
        body: JSON.stringify({
          gameId,
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
      store.update((s) => s.set(gameId, gameState))
    } finally {
      resetLoading = false
    }
  }

  return {
    ...store,
    getOrCreate,
    enterGuess,
    reset,
  }
})()

export const puzzleStores = derived(
  [wordleGameStates],
  ([$wordleGameStates]) => {
    return {
      wordle: $wordleGameStates,
      connections: new Map(),
      crossword: new Map(),
      sudoku: new Map(),
    }
  },
) as Readable<Record<PuzzleType, Map<GameId, PuzzleState>>>
