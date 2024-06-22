import { wordleGameCacheKey } from "$lib/server/gameCacheKeys"
import { supabaseGameStore } from "$lib/server/gameStateStorage"
import type { EvmAddress } from "$lib/types"
import { Game } from "../../../../lib/server/wordle/game"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({
  request,
  cookies,
  locals,
}): Promise<Response> => {
  const { guess, gameId, isDemo } = (await request.json()) as {
    guess: string
    gameId: string
    isDemo?: boolean
  }

  const user = locals.user as EvmAddress | undefined
  if (!user && !isDemo) return new Response("No user", { status: 401 })

  if (!gameId || !guess) {
    return new Response("Missing params", { status: 400 })
  }

  const hasGame = await supabaseGameStore.hasGame(
    "wordle",
    gameId,
    user,
    isDemo,
  )

  if (!hasGame) {
    return new Response("Game not found", { status: 404 })
  }

  const gameState = await supabaseGameStore.getGame(
    "wordle",
    gameId,
    user,
    isDemo,
  )

  const game = new Game(gameState)
  const valid = game.enter(guess)

  await supabaseGameStore.setGame(
    game.toString(),
    "wordle",
    gameId,
    user,
    isDemo,
  )

  const solved = game.won()
  const lost = game.answers.length >= 6 && !solved

  // Update cache
  cookies.set(wordleGameCacheKey(gameId), game.toString(), {
    path: "/",
  })

  return new Response(
    JSON.stringify({
      gameId,
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
      solved,
      lost,
      badGuess: !valid,
    }),
  )
}
