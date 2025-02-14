import { gameStateTable, supabaseGameStore } from "$lib/server/gameStateStorage"
import { signPlayerSolvedMessage } from "$lib/server/puzzleMaster"
import { supabase } from "$lib/server/supabaseClient"
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

  const { data, error } = await supabase
    .from(gameStateTable(false))
    .select("*")
    .eq("game_type", "wordle")
    .eq("game_id", gameId)
    .eq("user_address", user)
    .single()

  if (error || !data) {
    console.error("Error fetching game state", error)
    return new Response("Error fetching game state", { status: 500 })
  }

  const gameState = data.game_state
  const resetCount = data.reset_count

  console.log("verifying game state", gameState, "for user", user)
  const game = new Game(gameState)

  if (game.won()) {
    const score = game.score()
    console.log("signing for score/reset count", score, resetCount)

    return new Response(
      JSON.stringify({
        won: true,
        score,
        resetCount,
        signature: await signPlayerSolvedMessage(
          Number(gameId),
          user as EvmAddress,
          score,
          resetCount,
        ),
      }),
    )
  } else {
    return new Response(JSON.stringify({ won: false }))
  }
}
