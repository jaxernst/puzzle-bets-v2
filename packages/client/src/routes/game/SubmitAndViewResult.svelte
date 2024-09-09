<script lang="ts" context="module">
  let showConfirmSubmit = $state(false)

  export const openSubmitModal = () => {
    showConfirmSubmit = true
  }
</script>

<script lang="ts">
  import { getPlayerOutcomes } from "$lib/gameQueries"
  import type { EvmAddress } from "$lib"
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import { displayNameStore } from "$lib/displayNameStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { GameStatus, type PlayerGame } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatSigFig,
    formatTime,
    formatTimeAbbr,
  } from "$lib/util"
  import { twMerge } from "tailwind-merge"
  import { formatEther } from "viem"
  import Wallet from "$lib/icons/Wallet.svelte"
  import { prices } from "$lib/prices.svelte"
  import Star from "$lib/icons/Star.svelte"

  let {
    game,
    puzzleDueIn,
    class: className,
  } = $props<{
    user: EvmAddress
    game: PlayerGame
    puzzleDueIn: number
    class?: string
  }>()

  let showResults = $state(
    new URLSearchParams(window.location.search).get("results") === "true" ||
      false,
  )

  let submitting = $state(false)
  let submitError: null | string = $state(null)
  let claiming = $state(false)
  let claimError = $state(null)
  let votingRematch = $state(false)
  let outcomes = $derived(getPlayerOutcomes(game))
  let opponentName = $derived(displayNameStore.get(game.opponent))

  const confirmSubmit = async () => {
    showConfirmSubmit = false
    await verifyAndSubmitSolution()
  }

  const verifyAndSubmitSolution = async () => {
    if (submitting || !mud.systemCalls) return

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
        // submitError = "Puzzle not solved!"
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

  const claim = async () => {
    if (claiming || !mud.systemCalls) return

    claiming = true
    claimError = null

    try {
      await mud.systemCalls.claim(game.id)
    } catch (e: any) {
      claimError = e.shortMessage ?? "Something went wrong"
    } finally {
      claiming = false
    }
  }

  const voteRematch = async () => {
    if (votingRematch || !mud.systemCalls) return

    votingRematch = true

    try {
      await mud.systemCalls.voteRematch(game.id)
    } finally {
      votingRematch = false
    }
  }
</script>

{#if submitError}
  <div class="font-medium text-red-600">
    {submitError}
  </div>
{/if}

{#if !outcomes.canViewResults}
  <button
    class={twMerge(
      "rounded bg-black px-6 py-2 font-black text-white disabled:opacity-70",
      className,
    )}
    disabled={!outcomes.canSubmit || submitting}
    onclick={openSubmitModal}
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
    {#if !outcomes.gameOver}
      Game still active! Come back later to see final results and withdrawal
    {:else if outcomes.gameOutcome === "win"}
      Congrats you won!
      {#if outcomes.opponentMissedPlaybackWindow}
        <p class="text-sm font-medium">
          (Your opponent missed the playback window and forfeited the game)
        </p>
      {/if}
    {:else if outcomes.gameOutcome === "tie"}
      Tie game! You can withdraw your portion or vote to rematch
    {:else}
      You lost :( Better luck next time!
    {/if}
  </div>

  <div>
    <div class="flex items-center gap-1">
      <Avatar1 />
      You
    </div>

    Score: {game.myScore}
    <div>Rematch Vote: {Boolean(game.myRematchVote)}</div>
    <div>Contract balance: {formatEther(game.opponentBalance)} eth</div>
  </div>

  <div>
    <div class="flex items-center gap-1">
      <Avatar2 />
      {opponentName}
    </div>

    {#if game.opponentSubmitted}
      Score: {game.opponentScore}
    {:else if outcomes.waitingForOpponentPlayback}
      <p class="pt-1">
        Has {formatTime(outcomes.opponentPlaybackTime)} to start their turn...
      </p>
    {:else if outcomes.opponentSubmissionTimeRemaining > 0}
      <p>
        Opponent playing with {formatTime(
          outcomes.opponentSubmissionTimeRemaining,
        )} left to submit
      </p>
    {/if}

    <div>Rematch Vote: {Boolean(game.opponentRematchVote)}</div>
    <div>Contract balance: {formatEther(game.opponentBalance)} eth</div>
  </div>

  <hr />

  <div class="flex flex-col gap-2">
    <button
      class="flex justify-center rounded border-2 border-black bg-black p-3 text-base font-bold text-white disabled:opacity-55"
      disabled={!outcomes.gameOutcome ||
        outcomes.gameOutcome === "lose" ||
        outcomes.claimed}
      onclick={claim}
    >
      {#if claiming}
        <DotLoader class="fill-white " />
      {:else if outcomes.claimed}
        {formatSigFig(Number(formatEther(2n * game.buyInAmount)))} ETH Claimed
      {:else}
        Withdraw
      {/if}
    </button>

    {#if claimError}
      <p class="text=red-600">{claimError}</p>
    {/if}

    {#if outcomes.gameOutcome === "tie"}
      <button
        class="flex justify-center rounded border-2 border-black bg-black p-3 text-base font-bold text-white disabled:opacity-55"
        disabled={!outcomes.gameOutcome || outcomes.gameOutcome !== "tie"}
        onclick={voteRematch}
      >
        {#if votingRematch}
          <DotLoader class="fill-white " />
        {:else}
          Vote Rematch
        {/if}
      </button>
    {/if}
  </div>
</Modal>

<Modal bind:show={showConfirmSubmit} class="w-fit">
  {#snippet header()}
    Confirm Puzzle Submission
  {/snippet}

  <div
    class="self-start rounded-full bg-black p-2 text-xs font-bold text-white"
  >
    Puzzle Due in {formatTimeAbbr(puzzleDueIn)}
  </div>

  <p class="max-w-[300px]">
    Submit your solution before the deadline for a shot at victory!
  </p>

  <div class="flex flex-col gap-2">
    <button
      class="rounded bg-black px-6 py-2 font-black text-white disabled:opacity-70"
      onclick={confirmSubmit}
      disabled={submitting}
    >
      {submitting ? "Submitting..." : "Submit Puzzle"}
    </button>

    <button
      class="rounded border-2 border-black px-6 py-2 font-black"
      onclick={() => (showConfirmSubmit = false)}
    >
      Cancel
    </button>
  </div>
</Modal>
