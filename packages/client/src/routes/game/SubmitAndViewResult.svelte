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

  let showResults = $state(false)

  let submitted = $derived(
    Boolean(getPlayerSolutionState(user, game.id, mud).submitted),
  )

  let opponentName = $derived(displayNameStore.get(game.opponent))

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

  // Timers
  let timers = gameTimers(game)
  let mySubmissionTimeLeft = $derived(timers.submissionTimeLeft)

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

  let canSubmit = $derived(
    game.status === GameStatus.Active &&
      game.myStartTime &&
      mySubmissionTimeLeft &&
      !submitted &&
      !submitting,
  )

  let canViewResults = $derived(
    submitted ||
      mySubmissionTimeLeft === 0 ||
      game.status === GameStatus.Complete,
  )

  let waitingForOpponentPlayback = $derived(
    game.myStartTime && !game.opponentStartTime,
  )

  let gameOver = $derived.by(() => {
    if (game.iSubmitted && game.opponentSubmitted) return true
    if (mySubmissionTimeLeft === 0 && opponentSubmissionTimeRemaining === 0) {
      return true
    }

    return false
  })

  let gameOutcome = $derived.by(() => {
    if (!gameOver) return null
    if (game.myScore > game.opponentScore) return "win"
    if (game.myScore < game.opponentScore) return "lose"
    return "tie"
  })

  $inspect(gameOutcome, game)
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

  <div class="font-bold">
    {#if !gameOver}
      Game still active! Come back later to see final results and withdrawl
    {:else if gameOutcome === "win"}
      Congrats you won!
    {:else if gameOutcome === "tie"}
      Tie game! You can withdraw your portion or vote to rematch
    {:else}
      You lose :( Better luck next time!
    {/if}
  </div>

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

  <div class="flex flex-col gap-2">
    <button
      class="rounded border-2 border-black bg-black p-3 text-base font-bold text-white disabled:opacity-55"
      disabled={!gameOutcome || gameOutcome === "lose"}
    >
      Withdraw
    </button>

    <button
      class="rounded border-2 border-black bg-black p-3 text-base font-bold text-white disabled:opacity-55"
      disabled={!gameOutcome || gameOutcome !== "tie"}
    >
      Vote Rematch
    </button>
  </div>
</Modal>
