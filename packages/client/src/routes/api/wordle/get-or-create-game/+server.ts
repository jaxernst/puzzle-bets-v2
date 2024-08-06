import { wordleGameCacheKey } from "$lib/server/gameCacheKeys"
import { getGameResetCount } from "$lib/server/gameStateStorage"
import type { EvmAddress } from "$lib/types"
import { Game } from "../../../../lib/server/wordle/game"
import { getOrCreateDemo, getOrCreateLiveGame } from "./getOrCreate"
import { verifyGameParticipants } from "$lib/server/onchainChecks"

export const POST = async ({ request, cookies, locals }): Promise<Response> => {
  const { gameId, opponent, isDemo } = (await request.json()) as {
    gameId: string
    isDemo?: boolean
    opponent?: EvmAddress
  }

  if (!gameId) return new Response("Missing game ID", { status: 400 })

  const user = locals.user
  if (!user && !isDemo) return new Response("No user", { status: 401 })

  // For non-demo games, ensure that the gameId matches with the opponent and user address (onchain)
  if (!isDemo) {
    const inputParamsValid = await verifyGameParticipants(
      Number(gameId),
      user,
      opponent!,
    )

    if (!inputParamsValid) return new Response(null, { status: 400 })
  }

  const cachedGame = cookies.get(wordleGameCacheKey(gameId))

  let game: Game
  if (cachedGame) {
    game = new Game(cachedGame)
  } else if (isDemo) {
    game = await getOrCreateDemo(gameId)
    cookies.set(wordleGameCacheKey(gameId), game.toString(), { path: "/" })
  } else {
    if (!user || !opponent) throw new Error("Invariant error")
    game = await getOrCreateLiveGame(gameId, user, opponent)
    cookies.set(wordleGameCacheKey(gameId), game.toString(), { path: "/" })
  }

  const resetCount = await getGameResetCount(gameId)

  const solved = game.won()
  const lost = game.answers.length >= 6 && !solved

  return new Response(
    JSON.stringify({
      gameId,
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
      solved,
      lost,
      resetCount,
    }),
  )
}
