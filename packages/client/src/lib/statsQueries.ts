import { mud } from "./mudStore.svelte"
import {
  getPlayerGames,
  getActivePlayerGames,
  getPlayerOutcomes,
} from "./gameQueries"
import { GameStatus, type EvmAddress } from "$lib/types"

export function getPlayerStats(
  player: EvmAddress | undefined,
  _mud: typeof mud,
) {
  if (!player || !mud.synced || !mud.components) return null

  const playerGames = getPlayerGames(player, mud)
  const activeGames = getActivePlayerGames(player, _mud)

  const gameStats = playerGames.reduce(
    (stats, game) => {
      const outcome = getPlayerOutcomes(game)

      if (outcome.gameOver) {
        stats.totalBetAmount += game.buyInAmount

        if (outcome.gameOutcome === "win") {
          stats.numWins++
          stats.totalWonAmount += game.buyInAmount * 2n
        } else if (outcome.gameOutcome === "lose") {
          stats.numLosses++
        } else if (outcome.gameOutcome === "tie") {
          stats.numTies++
          stats.totalWonAmount += game.buyInAmount
        }
      }

      return stats
    },
    {
      numWins: 0,
      numLosses: 0,
      numTies: 0,
      totalBetAmount: 0n,
      totalWonAmount: 0n,
    },
  )

  const activeWagerAmount = activeGames.reduce(
    (total, game) => total + game.buyInAmount,
    0n,
  )

  return {
    ...gameStats,
    activeWagerAmount,
    numActiveGames: activeGames.length,
  }
}
