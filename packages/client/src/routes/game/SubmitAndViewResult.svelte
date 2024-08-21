<script lang="ts">
  import type { EvmAddress } from "$lib"
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import { displayNameStore } from "$lib/displayNameStore.svelte"
  import { getPlayerSolutionState } from "$lib/gameQueries"
  import { gameTimers } from "$lib/gameTimers.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import type { WordleGameState } from "$lib/puzzleGameState.svelte"
  import { GameStatus, type PlayerGame } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatTime,
    timeRemaining,
  } from "$lib/util"
  import { twMerge } from "tailwind-merge"

  let {
    game,
    user,
    puzzleState,
    class: className,
  } = $props<{
    user: EvmAddress
    game: PlayerGame
    class?: string
  }>()

  let timers = gameTimers(game)
  let submissionTimeLeft = $derived(timers.submissionTimeLeft)
  let submitted = $derived(
    Boolean(getPlayerSolutionState(user, game.id, mud).submitted),
  )

  let submitting = $state(false)
  let submitError: null | string = $state(null)
  const verifyAndSubmitSolution = async () => {
    if (!mud.systemCalls) return

    submitError = null
    submitting = true
    try {
      const res = await fetch(`/api/${game.type}/verify-user-solution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: parseInt(game.id, 16),
        }),
      })

      const { won, score, signature } = await res.json()
      if (!won) {
        submitError = "Puzzle not solved!"
        await mud.systemCalls.submitSolution(game.id, 0, "0x")
      } else {
        await mud.systemCalls.submitSolution(game.id, score, signature)
      }
    } catch (e: any) {
      console.error("Failed to submit solution")
      console.error(e)
      submitError = e.shortMessage ?? "Error submitting"
    } finally {
      submitting = false
    }
  }

  let canSubmit = $derived(
    game.status === GameStatus.Active &&
      game.myStartTime &&
      submissionTimeLeft &&
      !submitted &&
      !submitting,
  )

  let canViewResults = $derived(
    submitted ||
      submissionTimeLeft === 0 ||
      game.status === GameStatus.Complete,
  )

  let showResults = $state(false)

  /**
   Results modal:
    - Should show pot in usd and eth
    - Show your score (how many tries)
    - Show your opponent's score and status (whether they have started, 
      how much time they have left to play back)
    - Button to rematch if game was tied
    - Button to withdraw if game was tied or you won
  */
  let opponentName = $derived(displayNameStore.get(game.opponent))

  let opponentPlaybackTime = $state(0)
  let playbackTimer: NodeJS.Timer
  $effect(() => {
    if (game.myStartTime && !game.opponentStartTime) {
      playbackTimer = setInterval(() => {
        const due = Number(game.myStartTime) + game.playbackWindow
        opponentPlaybackTime = timeRemaining(due)
      }, 1000)
    }

    if (game.opponentStartTime) clearInterval(playbackTimer)
    return () => clearInterval(playbackTimer)
  })

  let opponentSubmissionTimeRemaining = $state(-1)
  let opponentSubmissionTimer: NodeJS.Timer
  $effect(() => {
    if (game.opponentStartTime) {
      opponentSubmissionTimer = setInterval(() => {
        const due = Number(game.opponentStartTime) + game.submissionWindow
        opponentSubmissionTimeRemaining = timeRemaining(due)
      })
    }

    if (game.opponentSubmitted) clearInterval(opponentSubmissionTimer)

    return () => {
      clearTimeout(opponentSubmissionTimer)
    }
  })

  let waitingForOpponentPlayback = $derived(
    game.myStartTime && !game.opponentStartTime,
  )

  // Still need:
  // gameOver = (over when both have submitted or submissionWindows have passed)
  // gaemOutcome = (tie win or lose - Only need to show once gameOver is true)
</script>

{#if submitError}
  <div class="font-medium text-red-600">
    {submitError}
  </div>
{/if}

{#if !canViewResults}
  <button
    class={twMerge(
      "rounded bg-black px-6 py-2 font-black text-white disabled:opacity-70",
      className,
    )}
    disabled={!canSubmit}
    onclick={verifyAndSubmitSolution}
  >
    Submit
  </button>
{:else}
  <button
    class={twMerge(
      "rounded bg-black px-6 py-2 font-black text-white disabled:opacity-70",
      className,
    )}
    onclick={() => (showResults = true)}
  >
    View Results
  </button>
{/if}

<Modal bind:show={showResults}>
  {#snippet header()}
    Results for {capitalized(game.type)} Game #{entityToInt(game.id)}
  {/snippet}

  <div>
    <div class="flex items-center gap-1">
      <Avatar1 />
      You
    </div>

    Score: {game.myScore}
    <div>Rematch Vote: {Boolean(game.myRematchVote)}</div>
  </div>

  <div>
    <div class="flex items-center gap-1">
      <Avatar2 />
      {opponentName}
    </div>

    {#if game.opponentSubmitted}
      Score: {game.opponentScore}
    {:else if waitingForOpponentPlayback}
      <p class="pt-1">
        Has {formatTime(opponentPlaybackTime)} to start their turn...
      </p>
    {:else if opponentSubmissionTimeRemaining > 0}
      <p>
        Opponent playing with {formatTime(opponentSubmissionTimeRemaining)} left
        to submit
      </p>
    {/if}

    <div>Rematch Vote: {Boolean(game.myRematchVote)}</div>
  </div>

  <hr />

  <button
    class="rounded border-2 border-black bg-black p-3 text-base font-bold text-white"
  >
    Withdraw
  </button>

  <button
    class="rounded border-2 border-black bg-black p-3 text-base font-bold text-white"
  >
    Vote Rematch
  </button>
</Modal>
