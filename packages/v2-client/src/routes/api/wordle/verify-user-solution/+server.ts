import { supabaseGameStore } from "$lib/server/gameStateStorage"
import { signPlayerSolvedMessage } from "$lib/server/puzzleMaster"
import type { EvmAddress } from "$lib/types"
import { Game } from "../../../../lib/server/wordle/game"

// Will need to add authentication to this endpoint to ensure players can't
// 'steal' attestations from each other
export const POST = async ({ request }): Promise<Response> => {
  const { gameId, user } = (await request.json()) as {
    gameId: string
    user: string
  }

  if (!gameId || !user) {
    return new Response("Missing params", { status: 400 })
  }

  const gameState = await supabaseGameStore.getGame("wordle", gameId, user)
  const game = new Game(gameState)

  if (game.won()) {
    const score = game.score()
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
