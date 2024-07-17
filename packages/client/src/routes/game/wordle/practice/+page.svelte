<script lang="ts">
  import { launchConfetti } from "$lib/components/Confetti.svelte"
  import Wordle from "$lib/game-components/Wordle.svelte"
  import { wordleGameStates } from "$lib/puzzleGameState.svelte"
  import { generateRandomID } from "$lib/util"
  import GameHeader from "../../GameHeader.svelte"
  import OpponentDisplay from "../../OpponentDisplay.svelte"

  const storedGameId = localStorage.getItem("wordleDemoGameId")
  const gameId = storedGameId ?? generateRandomID(32)

  if (!storedGameId) {
    localStorage.setItem("wordleDemoGameId", gameId)
  }

  let game = $derived($wordleGameStates.get(gameId)!)

  $effect(() => {
    if (!game) wordleGameStates.getOrCreate(gameId, true)
  })

  const enterGuess = async (guess: string) => {
    await wordleGameStates.enterGuess(gameId, guess, true)
    const puzzleState = $wordleGameStates.get(gameId)
    if (puzzleState?.solved) {
      launchConfetti()
    }
  }

  const reset = async () => {
    wordleGameStates.reset(gameId, true)
  }

  let showRestart = $state(false)
</script>

<div class="flex flex-col gap-4 p-4">
  <GameHeader puzzle="wordle" />
  <OpponentDisplay opponent={null} />

  <Wordle
    {...game}
    onSubmitGuess={enterGuess}
    onGameOver={() => {
      showRestart = true
    }}
  />
</div>

{#if showRestart || game?.solved || game?.lost}
  <div class="w-ful flex justify-center py-4">
    <button
      class="rounded-lg bg-black p-2 font-semibold text-white"
      onclick={() => {
        reset()
        showRestart = false
      }}
    >
      Restart Demo Game
    </button>
  </div>
{/if}
