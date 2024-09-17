import { mud } from "./mudStore.svelte"
import {
  getPlayerGames,
  getActivePlayerGames,
  getPlayerOutcomes,
} from "./gameQueries"
import { GameStatus, type EvmAddress } from "$lib/types"
import { getComponentValueStrict, HasValue, runQuery } from "@latticexyz/recs"

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
          const fee = (game.buyInAmount * 25n) / 1000n // 2.5% fee
          stats.totalWonAmount += game.buyInAmount - fee
        } else if (outcome.gameOutcome === "lose") {
          stats.numLosses++
        } else if (outcome.gameOutcome === "tie") {
          stats.numTies++
          stats.totalBetAmount -= game.buyInAmount
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

export function getLeaderboard(_mud: typeof mud) {
  const { synced, components } = _mud
  if (!synced || !components) return []

  const allPlayers = new Set<EvmAddress>()

  // Get all players who have participated in games
  const p1Games = runQuery([
    HasValue(components.GameStatus, { value: GameStatus.Complete }),
  ])

  p1Games.forEach((gameId) => {
    const p1 = getComponentValueStrict(components.Player1, gameId).value
    const p2 = getComponentValueStrict(components.Player2, gameId).value
    allPlayers.add(p1 as EvmAddress)
    allPlayers.add(p2 as EvmAddress)
  })

  // Calculate stats for each player
  const playerStats = Array.from(allPlayers).map((player) => {
    const stats = getPlayerStats(player, _mud)
    return {
      player,
      won: stats?.numWins ?? 0,
      lost: stats?.numLosses ?? 0,
      tied: stats?.numTies ?? 0,
      totalWonAmount: stats?.totalWonAmount ?? 0n,
    }
  })

  // Sort players by total won amount
  playerStats.sort((a, b) => Number(b.totalWonAmount - a.totalWonAmount))

  // Add rank to each player
  return playerStats.map((stats, index) => ({
    rank: index + 1,
    ...stats,
  }))
}
