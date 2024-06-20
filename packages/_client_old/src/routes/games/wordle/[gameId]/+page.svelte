<script lang="ts">
  import { page } from "$app/stores"
  import WordleGame from "../WordleGame.svelte"
  import { user } from "$lib/userStore"
  import { liveGameStatus, userGames, userSolvedGame } from "$lib/gameStores"
  import { GameStatus } from "$lib/types"
  import { launchConfetti } from "$lib/components/Confetti.svelte"
  import { wordleGameStates } from "../../puzzleGameStates"
  import { exportWordleBoard } from "../exportBoard"
  import { cubicOut } from "svelte/easing"
  import { slide } from "svelte/transition"
  import DotLoader from "$lib/components/DotLoader.svelte"

  $: gameId = $page.params.gameId
  $: puzzleState = $wordleGameStates.get(gameId)

  $: onchainGame = $userGames.find(
    (g) => parseInt(g.id, 16).toString() === $page.params.gameId,
  )

  $: if (!puzzleState && $user.address && onchainGame?.opponent) {
    wordleGameStates.getOrCreate(gameId, false, onchainGame.opponent)
  }

  $: if (
    onchainGame &&
    puzzleState &&
    onchainGame.rematchCount > (puzzleState.resetCount ?? 1e10)
  ) {
    wordleGameStates.reset(gameId, false)
  }

  $: enterGuess = async (guess: string) => {
    await wordleGameStates.enterGuess(gameId, guess, false)
    const puzzleState = $wordleGameStates.get(gameId)
    if (puzzleState?.solved) {
      launchConfetti()
    }
  }

  $: gameOver = puzzleState?.solved || puzzleState?.lost
  $: submitted =
    onchainGame && $userSolvedGame(onchainGame.id, $user.address).submitted

  $: liveStatus = onchainGame && liveGameStatus(onchainGame.id)
  $: expired = liveStatus && !$liveStatus?.submissionTimeLeft

  let copied = false
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
</script>

{#if puzzleState}
  <WordleGame
    data={puzzleState}
    paused={Boolean(
      gameOver ||
        submitted ||
        expired ||
        onchainGame?.status !== GameStatus.Active,
    )}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess)
    }}
  />
  {#if puzzleState.solved && !submitted && !expired}
    <div class="w-full text-center text-neutral-500">
      Submit your solution before the deadline
    </div>
  {/if}

  {#if puzzleState.solved || puzzleState.lost}
    <div class="flex w-full justify-center pt-2">
      <button
        class="bg-pb-yellow rounded-lg px-2 py-1 font-semibold text-white"
        on:click={() => copyBoard(puzzleState?.answers ?? [])}
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
{:else if !puzzleState}
  <div class="flex h-[200px] items-center justify-center self-center">
    <DotLoader class="h-10 w-10 fill-neutral-200" />
  </div>
{/if}
