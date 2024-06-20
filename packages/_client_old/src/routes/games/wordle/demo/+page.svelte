<script lang="ts">
  import WordleGame from "../WordleGame.svelte"
  import { launchConfetti } from "$lib/components/Confetti.svelte"
  import { wordleGameStates } from "../../puzzleGameStates"
  import { generateRandomID } from "$lib/util"
  import DotLoader from "$lib/components/DotLoader.svelte"

  const storedGameId = localStorage.getItem("wordleDemoGameId")
  const gameId = storedGameId ?? generateRandomID(32)

  if (!storedGameId) {
    localStorage.setItem("wordleDemoGameId", gameId)
  }

  $: game = $wordleGameStates.get(gameId)

  $: if (!game) {
    wordleGameStates.getOrCreate(gameId, true)
  }

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

  let showRestart = false
</script>

{#if game}
  <WordleGame
    data={game}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess)
    }}
    on:gameOver={(e) => {
      showRestart = true
    }}
  />
{:else if !game}
  <div class="flex h-[200px] items-center justify-center self-center">
    <DotLoader class="h-10 w-10 fill-neutral-500" />
  </div>
{/if}

{#if showRestart || game?.solved || game?.lost}
  <div class="w-ful flex justify-center py-4">
    <button
      class="rounded-lg bg-lime-500 p-2 font-semibold"
      on:click={() => {
        reset()
        showRestart = false
      }}
    >
      Restart Demo Game
    </button>
  </div>
{/if}
