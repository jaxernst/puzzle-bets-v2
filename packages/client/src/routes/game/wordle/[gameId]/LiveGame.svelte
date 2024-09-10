<script lang="ts">
  import Wordle from "$lib/game-components/Wordle.svelte"
  import {
    gameIdToGame,
    getGameTimers,
    getPlayerSolutionState,
  } from "$lib/gameQueries"
  import { user as userStore } from "$lib/userStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import {
    entityToInt,
    formatAsDollar,
    formatSigFig,
    formatTime,
  } from "$lib/util"
  import { wordleGameStates } from "$lib/puzzleGameState.svelte"
  import { exportWordleBoard } from "../exportBoard"
  import { launchConfetti } from "$lib/components/Confetti.svelte"
  import { GameStatus, type EvmAddress, type PlayerGame } from "$lib/types"
  import { slide } from "svelte/transition"
  import { cubicOut } from "svelte/easing"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import GameHeader from "../../GameHeader.svelte"
  import OpponentDisplay from "../../OpponentDisplay.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import { formatEther } from "viem"
  import { prices } from "$lib/prices.svelte"
  import { goto } from "$app/navigation"
  import { gameInviteUrls } from "$lib/inviteUrls"
  import type { Entity } from "@latticexyz/recs"
  import SubmitAndViewResult, {
    openSubmitModal,
  } from "../../SubmitAndViewResult.svelte"
  import LoadingButton from "$lib/components/LoadingButton.svelte"

  let { user, game } = $props<{
    user: EvmAddress
    game: PlayerGame
  }>()

  let gameId = $derived(game.id)
  let userIsPlayer = $derived(user === game?.p1 || user === game?.p2)
  let awaitingTurnStart = $derived(
    game.status === GameStatus.Active && !game.myStartTime,
  )

  let wagerEth = Number(formatEther(game.buyInAmount))
  let wagerUsd = $derived(formatAsDollar(wagerEth * prices.eth))

  let timers = $derived(getGameTimers(game))

  $effect(() => {
    if (!userIsPlayer) history.back()
  })

  let opponent = $derived.by(() => {
    if (!game?.p2) return
    if (game?.p2 === user) return game?.p1
    return game?.p2
  })

  let puzzleState = $derived(wordleGameStates.get(gameId))

  $effect(() => {
    if (!puzzleState && user && opponent) {
      wordleGameStates.getOrCreate(gameId, false, opponent)
    }
  })

  $effect(() => {
    if (
      game &&
      puzzleState &&
      game.rematchCount > (puzzleState.resetCount ?? 1e10)
    ) {
      wordleGameStates.reset(gameId, false)
    }
  })

  let enterGuess = $derived(async (guess: string) => {
    await wordleGameStates.enterGuess(gameId, guess, false)

    const puzzleState = wordleGameStates.get(gameId)
    if (puzzleState?.solved) {
      launchConfetti()
    }
  })

  let gameOver = $derived(puzzleState?.solved || puzzleState?.lost)
  let submitted = $derived(
    game && getPlayerSolutionState(user, gameId, mud).submitted,
  )

  let expired = false

  let copied = $state(false)
  const copyBoard = async (board: string[]) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(exportWordleBoard(gameId, board))
      copied = true
      setTimeout(() => (copied = false), 1800)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  let inviteCopied = $state(false)
  let inviteCopyError: string | null = $state(null)
  async function copyInviteUrl(gameId: Entity) {
    const inviteUrl = gameInviteUrls.getOrLoadInviteUrl(
      Number(entityToInt(gameId)),
    )

    if (!inviteUrl) {
      inviteCopyError =
        "No invite link found. Please create a new game to generate a new link."
      return
    }

    try {
      await navigator.clipboard.writeText(inviteUrl)
      inviteCopied = true
      setTimeout(() => (inviteCopied = false), 1800)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  let showCancelGame = $state(false)
  let showCancelGameSuccess = $state(false)
  let cancelGameState = $state<"loading" | "error" | null>(null)
  const cancelGame = async () => {
    if (cancelGameState === "loading") return

    cancelGameState = "loading"
    try {
      await mud.systemCalls?.cancelPendingGame(game.id)
      showCancelGame = false
      showCancelGameSuccess = true
    } catch {
      cancelGameState = "error"
      return
    }

    cancelGameState = null
  }

  $effect(() => {
    if (puzzleState?.solved && !submitted && !expired) {
      openSubmitModal()
    }
  })
</script>

<div
  class="mx-auto flex h-full w-full max-w-[1000px] flex-col items-center gap-4 overflow-y-auto px-4"
>
  <GameHeader {game} puzzle="wordle" disableSubmit={!gameOver || submitted} />
  <OpponentDisplay {opponent} pending={game.status === GameStatus.Pending} />

  {#if game.status === GameStatus.Pending && timers.inviteTimeLeft !== -1}
    <div
      class="mx-auto flex min-h-72 w-full max-w-[560px] flex-col items-center justify-evenly gap-6 rounded-xl border-2 border-black p-4 text-center text-base"
    >
      <div class="font-black">
        The Puzzle will be ready to reveal once your opponent joins.
      </div>

      <div
        class="rounded-full border-2 border-black px-2 py-1.5 text-sm font-semibold"
      >
        {#if timers.inviteTimeLeft > 0}
          Invite expires {formatTime(timers.inviteTimeLeft)}
        {:else}
          Invite Expired. Cancel Game to withdraw
        {/if}
      </div>

      <div class="w-full max-w-[375px] text-base">
        <button
          class="w-full rounded border-2 border-black bg-black p-3 font-bold text-white"
          onclick={() => copyInviteUrl(game.id)}
        >
          {#if inviteCopied}
            Invite Copied!
          {:else}
            Copy Invite Link
          {/if}
        </button>

        <button
          class="mt-2 w-full rounded p-3 font-bold underline"
          onclick={() => (showCancelGame = true)}
        >
          Cancel Game
        </button>

        {#if inviteCopyError}
          <p class="mt-2 text-red-600">{inviteCopyError}</p>
        {/if}
      </div>
    </div>
  {:else if awaitingTurnStart}
    <div
      class="mx-auto flex min-h-72 w-full flex-col items-center justify-evenly gap-6 rounded-xl border-2 border-black p-4 text-center text-base"
    >
      {#if timers.myPlaybackTime === 0}
        You did not play your opponent back in time. Wager forfeited.
      {:else if timers.myPlaybackTime > 0}
        <div class="font-bold">
          Your opponent has joined and started their timer. Your have {formatTime(
            timers.myPlaybackTime ?? 0,
          )}
          to start your turn.
          <div class="mt-2 text-sm font-normal">
            (This will initiate a blockchain transaction to start your game
            timer)
          </div>
        </div>

        <LoadingButton
          class="w-full max-w-[375px] rounded border-2 border-black bg-black p-3 text-base font-bold text-white"
          onClick={async () => await mud.systemCalls?.startTurn(gameId)}
        >
          Start Turn
        </LoadingButton>
      {/if}
    </div>
  {:else if puzzleState}
    <Wordle
      {...puzzleState}
      paused={Boolean(
        gameOver || submitted || game?.status !== GameStatus.Active,
      )}
      onSubmitGuess={enterGuess}
      onGameOver={() => {}}
    />

    {#if puzzleState.solved && !submitted && !expired}
      <div class="w-full text-center">
        Submit your solution before the deadline
      </div>
    {/if}

    {#if puzzleState.solved || puzzleState.lost}
      <div class="flex w-full justify-center">
        <button
          class="bg-pb-yellow rounded-md border-2 border-black px-2 py-1 font-semibold text-black"
          onclick={() => copyBoard(puzzleState?.answers ?? [])}
        >
          {#if copied}
            <div
              in:slide={{ axis: "x", easing: cubicOut }}
              class="whitespace-nowrap"
            >
              Copied
            </div>
          {:else}
            <div
              in:slide={{ axis: "x", easing: cubicOut }}
              class="whitespace-nowrap"
            >
              Share Board
            </div>
          {/if}
        </button>
      </div>
    {/if}
  {:else if game.status === GameStatus.Inactive}
    <p class="py-4 font-bold">Game Canceled</p>
  {:else if !puzzleState}
    <div class="flex h-[200px] items-center justify-center self-center">
      <DotLoader class="h-10 w-10 fill-black" />
    </div>
  {/if}

  <div class="min-h-5"></div>

  <div class="flex w-full grow items-end pb-1 md:hidden">
    <SubmitAndViewResult
      class="w-full"
      {game}
      {user}
      puzzleDueIn={timers.myPlaybackTime}
      disabled={!gameOver || submitted}
    />
  </div>
</div>

<Modal bind:show={showCancelGame} class="sm:w-[375px]">
  {#snippet header()}
    <div class="flex gap-1">
      <Stars />
      Cancel Game
    </div>
  {/snippet}

  <div class="flex flex-col gap-6">
    <div class="font-black leading-none">Are you sure you want to cancel?</div>

    <div class="text-base leading-tight">
      This will end the game and refund your original creation wager you
      selected. If nobody joins your game or the invite link expires, your wager
      will still be refunded all the same.
    </div>

    <div class="flex flex-col items-start gap-2">
      <div class="text-sm text-[#3f3f3f]">Your Wager</div>
      <div
        class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-2 py-1"
      >
        <Wallet class="h-[20px] w-[20px]" />

        <div>
          <span class="font-bold">{wagerUsd}</span>
          <span>/ {formatSigFig(wagerEth, 5)} ETH</span>
        </div>
      </div>
    </div>

    <hr />

    <div class="flex flex-col items-stretch gap-2">
      <button
        class="flex justify-center rounded border-2 border-black bg-black p-3 text-base font-bold text-white"
        onclick={cancelGame}
      >
        {#if cancelGameState === "loading"}
          <DotLoader class="fill-white " />
        {:else}
          Cancel the Game
        {/if}
      </button>

      <button
        class="rounded border-2 border-black bg-white p-3 text-center text-base font-bold"
        onclick={() => (showCancelGame = false)}
      >
        Go back to game
      </button>

      {#if cancelGameState === "error"}
        <p class="italic text-red-500">
          Error canceling game. Please try again
        </p>
      {/if}
    </div>
  </div>
</Modal>

<Modal
  bind:show={showCancelGameSuccess}
  onClose={() => goto("/dashboard")}
  class="sm:w-[375px]"
>
  {#snippet header()}
    <div class="flex gap-1">
      <Stars />
      Cancel Sucess
    </div>
  {/snippet}

  <div class="flex flex-col gap-6">
    <div class="font-black leading-none">Game Canceled!</div>

    <div class="text-base leading-tight">
      Your wager is been refunded to your wallet
    </div>

    <div class="flex flex-col items-start gap-2">
      <div class="text-sm text-[#3f3f3f]">Your Wager</div>
      <div
        class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-2 py-1"
      >
        <Wallet class="h-[20px] w-[20px]" />

        <div>
          <span class="font-bold">{wagerUsd}</span>
          <span>/ {formatSigFig(wagerEth, 5)} ETH</span>
        </div>
      </div>
    </div>

    <hr />

    <a
      class="flex justify-center rounded border-2 border-black bg-black p-3 text-base font-bold text-white"
      href="/dashboard"
    >
      Back to Dashboard
    </a>
  </div>
</Modal>
