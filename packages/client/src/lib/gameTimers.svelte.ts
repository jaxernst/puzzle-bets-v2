import type { PlayerGame } from "./types"
import { GameStatus } from "./types"
import { timeRemaining } from "./util"

export function gameTimers(game: PlayerGame) {
  let submissionTimeLeft = $state(game?.submissionWindow)

  let submissionTimer: NodeJS.Timer
  $effect(() => {
    if (!game) return

    if (
      game.status === GameStatus.Active &&
      game.myStartTime &&
      !submissionTimer
    ) {
      submissionTimer = setInterval(() => {
        submissionTimeLeft = timeRemaining(
          Number(game.myStartTime) + game.submissionWindow,
        )
      }, 1000)
    } else if (submissionTimer) {
      clearInterval(submissionTimer)
    }

    return () => {
      clearInterval(submissionTimer)
    }
  })

  return {
    get submissionTimeLeft() {
      return submissionTimeLeft
    },
  }
}
