<script lang="ts">
  import type { EvmAddress } from "$lib"
  import Modal from "$lib/components/Modal.svelte"
  import { getPlayerSolutionState } from "$lib/gameQueries"
  import { gameTimers } from "$lib/gameTimers.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { GameStatus, type PlayerGame } from "$lib/types"
  import { capitalized, entityToInt } from "$lib/util"
  import { twMerge } from "tailwind-merge"

  let {
    game,
    user,
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

  <div class="font-black leading-none">Game not over yet!</div>
</Modal>
