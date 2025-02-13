import { supabaseGameStore } from "$lib/server/gameStateStorage"
import { signPlayerSolvedMessage } from "$lib/server/puzzleMaster"
import type { EvmAddress } from "$lib/types"
import { Game } from "../../../../lib/server/wordle/game"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({
  request,
  locals,
}): Promise<Response> => {
  const { gameId } = (await request.json()) as {
    gameId: string
  }

  const user = locals.user as EvmAddress | undefined
  if (!user) return new Response("No user", { status: 401 })
  if (!gameId) {
    return new Response("Missing params", { status: 400 })
  }

  const gameState = await supabaseGameStore.getGame("wordle", gameId, user)
  console.log("verifying game state", gameState)
  const game = new Game(gameState)

  if (game.won()) {
    const score = game.score()
    console.log("signing for score", score)

    return new Response(
      JSON.stringify({
        won: true,
        score,
        signature: await signPlayerSolvedMessage(
          Number(gameId),
          user as EvmAddress,
          score,
        ),
      }),
    )
  } else {
    return new Response(JSON.stringify({ won: false }))
  }
}
