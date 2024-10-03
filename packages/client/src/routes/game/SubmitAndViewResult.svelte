<script lang="ts" context="module">
  let showConfirmSubmit = $state(false)
  let showResults = $state(false)

  export const openSubmitModal = () => {
    showConfirmSubmit = true
  }

  export const openResultsModal = () => {
    showResults = true
  }
</script>

<script lang="ts">
  import { getPlayerOutcomes } from "$lib/gameQueries"
  import type { EvmAddress } from "$lib"
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import LoadingButton from "$lib/components/LoadingButton.svelte"
  import { displayNameStore } from "$lib/displayNameStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { type PlayerGame } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatSigFig,
    formatTime,
    formatTimeAbbr,
  } from "$lib/util"
  import { twMerge } from "tailwind-merge"
  import { formatEther } from "viem"
  import Star from "$lib/icons/Star.svelte"
  import Coins from "$lib/icons/Coins.svelte"
  import Trophy from "$lib/icons/Trophy.svelte"
  import { goto } from "$app/navigation"

  let {
    game,
    class: className,
    disabled,
    failedToSolve,
  } = $props<{
    user: EvmAddress
    game: PlayerGame
    class?: string
    disabled?: boolean
    failedToSolve?: boolean
  }>()

  $effect(() => {
    if (new URLSearchParams(window.location.search).get("results") === "true") {
      showResults = true
    }
  })

  let submitting = $state(false)
  let claiming = $state(false)
  let votingRematch = $state(false)
  let outcomes = $derived(getPlayerOutcomes(game))
  let opponentName = $derived(displayNameStore.get(game.opponent))
  let puzzleDueIn = $derived(outcomes.mySubmissionTimeLeft)

  const confirmSubmit = async () => {
    const success = await submissionSolution()

    if (success) {
      showConfirmSubmit = false
      showResults = true
    }
  }

  const getPuzzleVerification = async () => {
    const res = await fetch(`/api/${game.type}/verify-user-solution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId: parseInt(game.id, 16),
      }),
    })

    return (await res.json()) as {
      won: boolean
      score: number
      signature: `0x${string}`
    }
  }

  let verificationFetching = false
  let puzzleVerification: {
    won: boolean
    score: number
    signature: `0x${string}`
  } | null = $state(null)

  // Fetch the verification as an effect (when the confirm modal is opened) so that the verification
  // doesn't need to be fetched when the user goes to make the submission transaction (the async delay
  // can cause the wallet popup to be blocked by the browser)
  $effect(() => {
    if (showConfirmSubmit && !puzzleVerification && !verificationFetching) {
      verificationFetching = true
      getPuzzleVerification()
        .then((verification) => {
          puzzleVerification = verification
        })
        .finally(() => {
          verificationFetching = false
        })
    }
  })

  const submissionSolution = async () => {
    if (submitting || !mud.systemCalls) return

    if (!puzzleVerification) {
      puzzleVerification = await getPuzzleVerification()
    }

    try {
      if (!puzzleVerification.won) {
        // submitError = "Puzzle not solved!"
        return await mud.systemCalls.submitSolution(game.id, 0, "0x")
      } else {
        return await mud.systemCalls.submitSolution(
          game.id,
          puzzleVerification.score,
          puzzleVerification.signature,
        )
      }
    } finally {
      submitting = false
    }
  }

  const claim = async () => {
    if (claiming || !mud.systemCalls) return

    claiming = true
    try {
      await mud.systemCalls.claim(game.id)
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

  // Add this constant for the protocol fee percentage
  const PROTOCOL_FEE_PERCENTAGE = 2.5

  // Modify the getClaimableAmount function to accept a player parameter
  const getClaimableAmount = (player: "user" | "opponent") => {
    const isWinner =
      player === "user"
        ? outcomes.gameOutcome === "win"
        : outcomes.gameOutcome === "lose"
    if (isWinner) {
      const totalPot = 2n * game.buyInAmount
      const protocolFee =
        (totalPot * BigInt(PROTOCOL_FEE_PERCENTAGE * 100)) / 10000n
      return totalPot - protocolFee
    } else if (outcomes.gameOutcome === "tie") {
      return game.buyInAmount
    }
    return 0n
  }
</script>

{#if !outcomes.canViewResults}
  <button
    class={twMerge(
      "rounded-t bg-black px-6 py-2 font-black text-white disabled:opacity-70 md:rounded",
      className,
    )}
    disabled={!outcomes.canSubmit || submitting || disabled}
    onclick={openSubmitModal}
  >
    Submit
  </button>
{:else}
  <button
    class={twMerge(
      "rounded-t bg-black px-6 py-2 font-black text-white disabled:opacity-70 md:rounded",
      className,
    )}
    onclick={() => (showResults = true)}
  >
    View Results
  </button>
{/if}

<Modal bind:show={showResults}>
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Trophy class="h-6 w-6" />
      Results for {capitalized(game.type)} Game #{entityToInt(game.id)}
    </div>
  {/snippet}

  <div class="font-bold">
    {#if !outcomes.gameOver}
      Game still active!
      <div class="text-sm font-medium">
        Come back later to see final results and withdraw
      </div>
    {:else if outcomes.gameOutcome === "win"}
      Congrats you won!
      {#if outcomes.opponentMissedPlaybackWindow}
        <p class="text-sm font-medium">
          (Your opponent missed the playback window and forfeited the game)
        </p>
      {/if}
    {:else if outcomes.gameOutcome === "tie"}
      Tie game!
      <div class="text-sm font-medium">
        You can withdraw your wager and start a new game
      </div>
    {:else}
      You lost :( Better luck next time!
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-1">
      <Avatar1 />
      You
    </div>

    <div class="flex gap-2">
      <div
        class="text-md flex items-center gap-2 self-start rounded-full bg-[#ccccccbf] px-2 py-1 font-bold"
      >
        <Star class="h-[21px] w-[20px]" />
        Score: {game.myScore}
      </div>

      {#if outcomes.gameOutcome === "win" && outcomes.claimed}
        <div
          class="text-md bg-pb-yellow flex items-center gap-2 self-start rounded-full px-2 py-1 font-bold"
        >
          <Trophy class="h-[21px] w-[20px]" />
          Claimed {formatSigFig(
            Number(formatEther(getClaimableAmount("user"))),
            3,
          )} ETH
        </div>
      {:else if outcomes.gameOutcome !== "lose" || !outcomes.opponentClaimed}
        <div
          class="text-md flex items-center gap-2 self-start rounded-full bg-[#ccccccbf] px-2 py-1 font-bold"
        >
          <Coins class="h-[21px] w-[20px]" />
          Balance: {formatSigFig(Number(formatEther(game.myBalance)), 2)} ETH
        </div>
      {/if}
    </div>

    {#if outcomes.iMissedPlaybackWindow}
      <p class="text-sm italic">Playback window missed: Game forfeited.</p>
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-1">
      <Avatar2 />
      {opponentName}
    </div>

    <div class="flex gap-2">
      <div
        class="text-md flex items-center gap-2 self-start rounded-full bg-[#ccccccbf] px-2 py-1 font-bold"
      >
        <Star class="h-[21px] w-[20px]" />
        Score: {game.opponentSubmitted || outcomes.gameOver
          ? game.opponentScore
          : "Pending"}
      </div>

      {#if outcomes.gameOutcome === "lose" && outcomes.opponentClaimed}
        <div
          class="text-md bg-pb-yellow flex items-center gap-2 self-start rounded-full px-2 py-1 font-bold"
        >
          <Trophy class="h-[21px] w-[20px]" />
          Claimed {formatSigFig(
            Number(formatEther(getClaimableAmount("opponent"))),
            3,
          )} ETH
        </div>
      {:else if outcomes.gameOutcome !== "win" || !outcomes.claimed}
        <div
          class="text-md flex items-center gap-2 self-start rounded-full bg-[#ccccccbf] px-2 py-1 font-bold"
        >
          <Coins class="h-[21px] w-[20px]" />
          Balance: {formatSigFig(Number(formatEther(game.opponentBalance)), 2)} ETH
        </div>
      {/if}
    </div>

    <p class="text-sm italic">
      {#if outcomes.waitingForOpponentPlayback}
        Has {formatTime(outcomes.opponentPlaybackTime)} to start their turn...
      {:else if outcomes.opponentSubmissionTimeRemaining > 0 && !outcomes.gameOver}
        Opponent playing with {formatTime(
          outcomes.opponentSubmissionTimeRemaining,
        )} left to submit
      {/if}
    </p>
  </div>

  <hr />

  <div class="flex flex-col">
    {#if outcomes.gameOutcome === "lose" || outcomes.claimed}
      <button
        class="flex justify-center rounded border-2 border-black bg-black p-3 text-base font-bold text-white disabled:opacity-55"
        onclick={() => goto("/dashboard")}
      >
        Return to Dashboard
      </button>
    {:else}
      <button
        class="flex justify-center rounded border-2 border-black bg-black p-3 text-base font-bold text-white disabled:opacity-55"
        disabled={!outcomes.gameOutcome || outcomes.claimed}
        onclick={claim}
      >
        {#if claiming || verificationFetching}
          <DotLoader class="fill-white " />
        {:else if outcomes.gameOutcome === "tie"}
          Withdraw {formatSigFig(Number(formatEther(game.buyInAmount)), 3)} ETH
        {:else if outcomes.gameOutcome === "win"}
          Claim Pot {formatSigFig(
            Number(formatEther(getClaimableAmount("user"))),
            3,
          )}
          ETH
        {:else if !outcomes.gameOutcome}
          Check back later to claim
        {/if}
      </button>

      {#if outcomes.gameOutcome === "win"}
        <p class="mt-1.5 self-center text-sm">
          {PROTOCOL_FEE_PERCENTAGE}% protocol fee applied
        </p>
      {/if}
    {/if}

    {#if outcomes.claimed}
      <p class="mt-1.5 self-center text-sm font-bold">
        {formatSigFig(Number(formatEther(getClaimableAmount("user"))), 3)} ETH Claimed
      </p>
    {/if}

    <!--  Rematch Button
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
    {/if} -->
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

  <div class="leading-tight sm:max-w-[300px]">
    {#if failedToSolve}
      <p>You did not solve the puzzle :(</p>
      <p class="mt-3">
        Submit now with a 0 score to see your opponent's status or wait until
        the time runs out...
      </p>
    {:else}
      Submit your solution before the deadline for a shot at victory!
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    <LoadingButton
      class="rounded bg-black px-6 py-2 font-black text-white disabled:opacity-70"
      onClick={confirmSubmit}
      disabled={submitting}
    >
      {submitting ? "Submitting..." : "Submit Puzzle"}
    </LoadingButton>

    <button
      class="rounded border-2 border-black px-6 py-2 font-black"
      onclick={() => (showConfirmSubmit = false)}
    >
      Cancel
    </button>
  </div>
</Modal>
