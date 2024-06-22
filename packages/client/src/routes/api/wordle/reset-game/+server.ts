import { wordleGameCacheKey } from "$lib/server/gameCacheKeys"
import { supabaseGameStore } from "$lib/server/gameStateStorage.js"
import {
  getGameRematchCount,
  verifyGameParticipants,
} from "$lib/server/onchainChecks"
import type { EvmAddress } from "$lib/types"
import { Game } from "../../../../lib/server/wordle/game"
import type { RequestHandler } from "./$types"

const initialGameState = (gameId: string) => ({
  gameId,
  guesses: [],
  answers: [],
  solved: false,
  lost: false,
  answer: null,
  badGuess: false,
})

const resetDemoGame = async (gameId: string) => {
  const hasGame = supabaseGameStore.hasGame("wordle", gameId, undefined, true)
  if (!hasGame) return new Response("No game to reset", { status: 400 })

  const game = new Game()
  await supabaseGameStore.setGame(
    game.toString(),
    "wordle",
    gameId,
    undefined,
    true,
  )

  return new Response(JSON.stringify(initialGameState(gameId)))
}

const resetLiveGame = async (
  gameId: string,
  user: EvmAddress,
  opponent: EvmAddress,
) => {
  const [hasGame, participantsValid, onchainResetCount] = await Promise.all([
    supabaseGameStore.hasGame("wordle", gameId, user, false),
    verifyGameParticipants(Number(gameId), user, opponent),
    getGameRematchCount(Number(gameId)),
  ])

  if (!hasGame) return new Response("No game to reset", { status: 400 })
  if (!participantsValid) {
    return new Response("Invalid participants", { status: 401 })
  }

  const game = new Game()
  const success = await supabaseGameStore.resetDuelGame(
    gameId,
    game.toString(),
    onchainResetCount,
  )

  if (!success) {
    return new Response("Game not resetable", { status: 403 })
  }

  return new Response(
    JSON.stringify({
      ...initialGameState(gameId),
      resetCount: onchainResetCount,
    }),
  )
}

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
  const { gameId, isDemo, otherPlayer } = (await request.json()) as {
    gameId: string
    isDemo?: boolean
    otherPlayer?: EvmAddress
    chainRematchCount?: number
  }

  if (!gameId) return new Response("Missing game ID", { status: 400 })

  // Optimistically clear cookie cache for game
  const cachedGame = cookies.get(wordleGameCacheKey(gameId))
  if (cachedGame) {
    cookies.delete(wordleGameCacheKey(gameId), { path: "/" })
  }

  if (isDemo) {
    return resetDemoGame(gameId)
  } else {
    const user = locals.user as EvmAddress | undefined
    if (!user) return new Response("No user", { status: 401 })
    if (!otherPlayer) return new Response("No opponent", { status: 401 })

    return resetLiveGame(gameId, user, otherPlayer)
  }
}
