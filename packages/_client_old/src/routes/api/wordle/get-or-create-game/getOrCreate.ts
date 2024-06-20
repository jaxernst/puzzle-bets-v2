import { supabaseGameStore } from "$lib/server/gameStateStorage"
import { Game } from "../../../../lib/server/wordle/game"

export const getOrCreateDemo = async (gameId: string, user?: string) => {
  const hasGame = await supabaseGameStore.hasGame("wordle", gameId, user, true)

  if (hasGame) {
    const gameState = await supabaseGameStore.getGame(
      "wordle",
      gameId,
      user,
      true,
    )
    return new Game(gameState)
  } else {
    const game = new Game()
    await supabaseGameStore.setGame(
      game.toString(),
      "wordle",
      gameId,
      user,
      true,
    )
    return game
  }
}

export const getOrCreateLiveGame = async (
  gameId: string,
  user: string,
  opponent: string,
) => {
  // One call to get get -> returns the game state if it exists
  let gameState = await supabaseGameStore.getGame("wordle", gameId, user)
  if (!gameState) {
    await supabaseGameStore.createDuelGame(
      new Game().toString(),
      "wordle",
      gameId,
      user,
      opponent,
    )

    gameState = await supabaseGameStore.getGame("wordle", gameId, user)
    if (!gameState) throw new Error("Game could not be created")
  }

  return new Game(gameState)
}
