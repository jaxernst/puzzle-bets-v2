<script lang="ts">
  import { mud } from "$lib/mud/mudStore"
  import { user } from "$lib/userStore"
  import { type Entity } from "@latticexyz/recs"
  import NewGameModal from "./new-game/NewGame.svelte"
  import { GameStatus, type Game, type PuzzleType } from "$lib/types"
  import { capitalized, entityToInt } from "$lib/util"
  import Modal from "$lib/components/Modal.svelte"
  import GameResults from "./GameResults.svelte"
  import {
    liveGameStatus,
    userSolvedGame,
    type LiveStatus,
    userArchivedGames,
  } from "$lib/gameStores"
  import { gameInviteUrls } from "$lib/inviteUrls"
  import { readable, writable, type Readable } from "svelte/store"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { puzzleStores } from "./puzzleGameStates"
  import { slide } from "svelte/transition"
  import { cubicOut } from "svelte/easing"
  import ButtonPrimary from "$lib/components/ButtonPrimary.svelte"

  export let puzzleType: PuzzleType
  export let gameId: Entity | null = null

  let liveStatus: Readable<LiveStatus | null> = readable(null)
  $: if (gameId) {
    liveStatus = liveGameStatus(gameId)
  } else {
    liveStatus = readable(null)
  }

  $: puzzleState = gameId && $puzzleStores[puzzleType].get(entityToInt(gameId))

  let showNewGameModal = false
  let showResultsModal = false

  let submitting = false
  let submitError: null | string = null
  $: submitted = gameId && $userSolvedGame(gameId, $user.address).submitted
  const verifyAndSubmitSolution = async () => {
    if (!gameId || !$mud.systemCalls) return

    submitError = null
    submitting = true
    try {
      const res = await fetch(`/api/${puzzleType}/verify-user-solution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: parseInt(gameId, 16),
        }),
      })

      const data = await res.json()

      await $mud.systemCalls.submitSolution(gameId, data.score, data.signature)
      submitted = true
    } catch (e: any) {
      console.error("Failed to submit solution")
      console.error(e)
      submitError = e.shortMessage ?? "Error submitting"
    } finally {
      submitting = false
    }
  }

  $: if (submitError) {
    setTimeout(() => {
      submitError = null
    }, 3000)
  }

  $: canViewResult =
    $liveStatus?.status === GameStatus.Complete ||
    $liveStatus?.submissionTimeLeft === 0 ||
    submitted

  $: gameHidden = $userArchivedGames.some((g) => g === gameId)
  $: hideOrShowGame = () => {
    if (!gameId) return
    userArchivedGames.setArchivedState(gameId, !gameHidden)
  }

  let cancellingGame = false
  $: cancelAndArchive = async () => {
    if (!gameId || !$mud.systemCalls) return
    cancellingGame = true
    try {
      await $mud.systemCalls.cancelPendingGame(gameId)
      userArchivedGames.setArchivedState(gameId, true)
    } catch (e) {
      console.error("Failed to cancel invite")
      console.error(e)
    } finally {
      cancellingGame = false
    }
  }

  let urlCopied = false
  $: copyInviteUrl = () => {
    if (!gameId) return
    const gId = Number(entityToInt(gameId))
    let url = gameInviteUrls.getOrLoadInviteUrl(gId)

    // TODO: If we don't have a url saved (with the password) and the game is password protected,
    // set and error to alert the user
    if (!url) {
      url = gameInviteUrls.create({
        gameId: gId,
        puzzleType,
      })
    }

    navigator.clipboard.writeText(url)

    urlCopied = true
    setTimeout(() => {
      urlCopied = false
    }, 1700)
  }
</script>

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false
  }}
>
  <NewGameModal {puzzleType} />
</Modal>

{#if gameId}
  <Modal
    show={showResultsModal}
    on:close={() => {
      showResultsModal = false
    }}
  >
    <GameResults {gameId} onClose={() => (showResultsModal = false)} />
  </Modal>
{/if}

<div class="flex flex-col px-2 text-sm sm:text-base">
  <div
    class={`flex items-center gap-2 ${
      !gameId ? "justify-center" : "justify-between"
    }`}
  >
    <div
      class={`text-off-black flex-grow text-lg font-bold
      ${!gameId ? "text-center" : ""}
    `}
    >
      {capitalized(puzzleType)}
      {gameId ? `#${entityToInt(gameId)}` : "(practice game)"}
    </div>

    {#if $liveStatus?.status === GameStatus.Pending}
      <ButtonPrimary on:click={copyInviteUrl} class="rounded-full text-sm">
        {#if urlCopied}
          <div in:slide={{ axis: "x" }}>Invite Copied!</div>
        {:else}
          <div in:slide={{ axis: "x", easing: cubicOut }}>Copy Invite</div>
        {/if}
      </ButtonPrimary>
      <button
        class="text-sm font-semibold text-neutral-400"
        on:click={cancelAndArchive}
      >
        {#if cancellingGame}
          <DotLoader class="fill-neutral-400" />
        {:else}
          Cancel
        {/if}
      </button>
    {:else if canViewResult}
      <ButtonPrimary
        on:click={() => {
          showResultsModal = true
        }}
        class="rounded-full text-sm"
      >
        View Results
      </ButtonPrimary>
    {:else if $liveStatus?.status === GameStatus.Active}
      <ButtonPrimary
        class={`${
          submitError ? "bg-red-500 italic hover:bg-red-400" : "bg-lime-500"
        } flex min-w-[70px] justify-center rounded-full `}
        on:click={verifyAndSubmitSolution}
      >
        {#if submitting}
          <DotLoader />
        {:else if submitError}
          {submitError}
        {:else}
          Submit
        {/if}
      </ButtonPrimary>
    {/if}

    {#if gameId && ($liveStatus?.status === GameStatus.Complete || $liveStatus?.status === GameStatus.Inactive)}
      <button
        on:click={hideOrShowGame}
        class="text-sm font-semibold text-neutral-400"
      >
        {#if gameHidden}
          Unarchive
        {:else}
          Archive
        {/if}
      </button>
    {/if}
  </div>
</div>
