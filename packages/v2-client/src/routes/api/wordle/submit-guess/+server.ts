import { wordleGameCacheKey } from "$lib/server/gameCacheKeys"
import { supabaseGameStore } from "$lib/server/gameStateStorage"
import { Game } from "../../../../lib/server/wordle/game"

export const POST = async ({ request, cookies }): Promise<Response> => {
  const { guess, gameId, user, isDemo } = (await request.json()) as {
    guess: string
    gameId: string
    user?: string
    isDemo?: boolean
  }

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
