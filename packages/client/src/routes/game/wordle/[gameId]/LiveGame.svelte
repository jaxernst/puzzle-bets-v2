<script lang="ts">
  import Wordle from "$lib/game-components/Wordle.svelte"
  import { page } from "$app/stores"
  import { gameIdToGame, getPlayerSolutionState } from "$lib/gameQueries"
  import { user as userStore } from "$lib/userStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { intToEntity } from "$lib/util"
  import { wordleGameStates } from "$lib/puzzleGameState.svelte"
  import { exportWordleBoard } from "../exportBoard"
  import { launchConfetti } from "$lib/components/Confetti.svelte"
  import { GameStatus, type EvmAddress, type Game } from "$lib/types"
  import { slide } from "svelte/transition"
  import { cubicOut } from "svelte/easing"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { type Components } from "$lib/mud/setupNetwork"
  import GameHeader from "../../GameHeader.svelte"
  import OpponentDisplay from "../../OpponentDisplay.svelte"

  let { user, game } = $props<{
    user: EvmAddress
    game: Game
  }>()

  let gameEntity = intToEntity($page.params.gameId)!
  let gameId = $derived(game.id)

  let userIsPlayer = $derived(user === game?.p1 || user === game?.p2)

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
      wordleGameStates.getOrCreate(gameId, false, user)
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
</script>

<div class="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-4">
  <GameHeader gameId={game.id} puzzle="wordle" />
  <OpponentDisplay {opponent} />

  {#if game.status === GameStatus.Pending}
    <div
      class="mx-auto flex w-full flex-col items-center gap-4 rounded-xl border-2 border-black py-20"
    >
      <div class="font-extrabold">
        The Puzzle will be ready to reveal once your opponent joins.
      </div>
      <div>The puzzle timer will not start until you reveal.</div>
    </div>
  {:else if puzzleState}
    <Wordle
      {...puzzleState}
      paused={Boolean(
        gameOver || submitted || expired || game?.status !== GameStatus.Active,
      )}
      onSubmitGuess={enterGuess}
      onGameOver={() => {}}
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
  {:else if !puzzleState}
    <div class="flex h-[200px] items-center justify-center self-center">
      <DotLoader class="fill-pb-gray-1 h-10 w-10" />
    </div>
  {/if}
</div>
