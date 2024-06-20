<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { ethPrice } from "$lib/ethPrice"
  import { getGame, liveGameStatus, userSolvedGame } from "$lib/gameStores"
  import { mud } from "$lib/mud/mudStore"
  import { user } from "$lib/userStore"
  import { GameStatus, type StartedGame } from "$lib/types"
  import {
    entityToInt,
    formatAsDollar,
    formatTime,
    weiToDollar,
  } from "$lib/util"
  import type { Entity } from "@latticexyz/recs"
  import { slide } from "svelte/transition"
  import { formatEther } from "viem"
  import { puzzleStores } from "./puzzleGameStates"

  export let gameId: Entity
  export let onClaimed = () => {}
  export let onClose = () => {}

  const PROTOCOL_FEE = 0.025

  $: game = $getGame(gameId, { expectStarted: true }) as StartedGame
  $: userPuzzleState = $puzzleStores[game.type]?.get(entityToInt(gameId))

  $: potSizeUsd = Number(formatEther(game.buyInAmount * 2n)) * $ethPrice

  $: liveStatus = liveGameStatus(gameId)

  $: ({ submitted: p1Submitted, score: p1Score } = $userSolvedGame(
    gameId,
    game?.p1,
  ))

  $: ({ submitted: p2Submitted, score: p2Score } = $userSolvedGame(
    gameId,
    game?.p2,
  ))

  $: gameActive = ($liveStatus?.submissionTimeLeft ?? 0) > 0

  $: gameOutcome = (() => {
    const bothSubmitted = p1Submitted && p2Submitted
    const timeRemaining = ($liveStatus?.submissionTimeLeft ?? 0) > 0
    if (timeRemaining && !bothSubmitted) return null

    if (p1Score === p2Score) {
      return "tie"
    } else if (p1Score > p2Score) {
      return $user.address === game.p1 ? "won" : "lost"
    } else {
      return $user.address === game.p1 ? "lost" : "won"
    }
  })()

  $: userBalance = $user.address === game.p1 ? game.p1Balance : game.p2Balance
  $: opponentBalance =
    $user.address === game.p1 ? game.p2Balance : game.p1Balance

  $: claimed = (() => {
    // If we won, we know we have 'claimed' once game status is complete
    if (gameOutcome === "won" && game.status === GameStatus.Complete)
      return true

    // In tie game, we've 'claimed' once our balance is 0
    if (gameOutcome === "tie") {
      if (game.buyInAmount) {
        return userBalance === 0n
      } else {
        return game.status === GameStatus.Complete
      }
    }

    // Can't claim if we lost
    return false
  })()

  $: opponentClaimed = Boolean(
    game.buyInAmount && gameOutcome !== "won" && opponentBalance === 0n,
  )

  let claimLoading = false
  let claimError: string | null = null
  $: claim = async () => {
    if (!$mud.systemCalls) return

    claimLoading = true
    claimError = null
    try {
      await $mud.systemCalls.claim(gameId)
      onClaimed()
    } catch (e: any) {
      console.error(e)
      claimError = e.shortMessage ?? "error occurred"
    } finally {
      claimLoading = false
    }
  }

  $: [userVotedRematch, opponentVotedRematch] =
    $user.address === game.p1
      ? [game.p1Rematch, game.p2Rematch]
      : [game.p2Rematch, game.p1Rematch]

  let startingRematchCount: number | null = null
  $: if (startingRematchCount === null && game) {
    startingRematchCount = game.rematchCount
  }

  // If the rematch count changes, the game was reset, so close out of the results
  $: if (
    startingRematchCount !== null &&
    game.rematchCount !== startingRematchCount
  ) {
    onClose?.()
  }

  let voteRematchLoading = false
  let voteRematchError: null | string = null
  $: voteRematch = async () => {
    if (!$mud.systemCalls) return

    voteRematchLoading = true
    voteRematchError = null
    try {
      const willTriggerRematch = opponentVotedRematch
      await $mud.systemCalls.voteRematch(gameId)

      if (willTriggerRematch) {
        fetch(`/api/notifications/${game.p1}/notify-game-rematch`, {
          method: "POST",
        })
      }
    } catch (e: any) {
      console.error(e)
      voteRematchError = e.shortMessage ?? "error occurred"
    } finally {
      voteRematchLoading = false
    }
  }
</script>

<div
  class="flex min-w-[350px] max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-4 sm:p-5"
>
  <div class="flex flex-col gap-7 font-semibold">
    <div class="flex items-center justify-between gap-5">
      <div class="">Game #{parseInt(gameId, 16)} Results</div>
      <div
        class="self-center rounded-xl border border-lime-500 px-3 py-1 text-lime-500"
      >
        ${potSizeUsd.toFixed(2)} pot
      </div>
    </div>
    <div class="self-center text-sm">
      <div
        class={`grid justify-items-center rounded-lg bg-neutral-700 p-2 ${
          game.p1Rematch || game.p2Rematch
            ? "grid-cols-[auto_1fr_1fr_1fr_1fr]"
            : "grid-cols-[auto_1fr_1fr_1fr]"
        } gap-3`}
      >
        <div class="font-semibold text-neutral-400">Player</div>
        <div class="font-semibold text-neutral-400">Submitted</div>
        <div class="font-semibold text-neutral-400">Attempts</div>
        <div class="font-semibold text-neutral-400">Balance</div>
        {#if game.p1Rematch || game.p2Rematch}
          <div class="font-semibold text-neutral-400">Rematch</div>
        {/if}

        <div class="whitespace-nowrap text-xs sm:text-sm">
          #1 {$user.address === game.p1 ? "(you)" : ""}
        </div>
        <div>{p1Submitted ? "✅" : "❌"}</div>
        <div>{p1Score === 0 ? "-" : 7 - p1Score}</div>
        <div>{weiToDollar(game.p1Balance, $ethPrice)}</div>
        {#if game.p1Rematch || game.p2Rematch}
          <div>{game.p1Rematch ? "✅" : ""}</div>
        {/if}

        <div class="whitespace-nowrap text-xs sm:text-sm">
          #2 {$user.address === game.p2 ? "(you)" : ""}
        </div>
        <div>{p2Submitted ? "✅" : "❌"}</div>
        <div>{p2Score === 0 ? "-" : 7 - p2Score}</div>
        <div>{weiToDollar(game.p2Balance, $ethPrice)}</div>
        {#if game.p2Rematch || game.p1Rematch}
          <div>{game.p2Rematch ? "✅" : ""}</div>
        {/if}
      </div>
    </div>

    <div class="flex flex-col items-center gap-1 p-3">
      {#if gameOutcome === "lost"}
        <span class="text-pb-yellow">
          You lost :( Your opponent won the pot
        </span>
      {:else if gameOutcome === "won"}
        <button
          class={`self-center whitespace-nowrap rounded-lg bg-lime-500 p-2 ${
            claimed ? "opacity-50" : ""
          }`}
          disabled={claimed}
          on:click={claim}
          in:slide={{ axis: "x" }}
        >
          {#if claimLoading}
            <DotLoader />
          {:else if claimed || game.status === GameStatus.Complete}
            {formatAsDollar(potSizeUsd * (1 - PROTOCOL_FEE))} claimed!
          {:else}
            You won! Click to claim your winnings
          {/if}
        </button>
      {:else if gameOutcome === "tie"}
        {#if !claimed && !opponentClaimed}
          <button
            class={`self-center whitespace-nowrap rounded-lg bg-lime-500 p-2 ${
              userVotedRematch ? "opacity-50" : ""
            }`}
            disabled={userVotedRematch}
            on:click={voteRematch}
            in:slide={{ axis: "x" }}
          >
            {#if voteRematchLoading}
              <DotLoader />
            {:else if userVotedRematch}
              Voted to rematch
            {:else}
              It's a tie! Vote to rematch?
            {/if}
          </button>
          <span class="text-sm text-neutral-400">or</span>
        {/if}
        <button
          class={`border-pb-yellow self-center whitespace-nowrap rounded-lg border p-2 text-neutral-100 ${
            claimed ? "opacity-50" : ""
          }`}
          disabled={claimed}
          on:click={claim}
          in:slide={{ axis: "x" }}
        >
          {#if claimLoading}
            <DotLoader class="fill-neutral-100" />
          {:else if claimed}
            {formatAsDollar(potSizeUsd / 2)} claimed!
          {:else if !game.buyInAmount}
            Finalize Game
          {:else}
            Withdraw wager
          {/if}
        </button>
      {/if}

      {#if $liveStatus?.submissionTimeLeft && !gameOutcome}
        <div class="text-sm italic text-neutral-400">
          {formatTime($liveStatus.submissionTimeLeft)} remaining...
        </div>
      {/if}
    </div>

    {#if claimError || voteRematchError}
      <div class="text-sm text-red-500">{claimError ?? voteRematchError}</div>
    {/if}
  </div>
</div>
