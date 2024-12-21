<script lang="ts">
  import { launchConfetti } from "$lib/components/Confetti.svelte"
  import Wordle from "$lib/game-components/Wordle.svelte"
  import { wordleGameStates } from "$lib/puzzleGameState.svelte"
  import { generateRandomID } from "$lib/util"
  import GameHeader from "$lib/game-components/GameHeader.svelte"
  import OpponentDisplay from "$lib/game-components/OpponentDisplay.svelte"
  import { user } from "$lib/userStore.svelte"
  import { parseEther } from "viem"
  import { toastInfo } from "$lib/toast"

  const storedGameId = localStorage.getItem("wordleDemoGameId")
  const gameId = storedGameId ?? generateRandomID(32)

  if (!storedGameId) {
    localStorage.setItem("wordleDemoGameId", gameId)
  }

  let game = $derived(wordleGameStates.get(gameId)!)

  $effect(() => {
    if (!game) wordleGameStates.getOrCreate(gameId, true)
  })

  const enterGuess = async (guess: string) => {
    await wordleGameStates.enterGuess(gameId, guess, true)
    const puzzleState = wordleGameStates.get(gameId)

    if (puzzleState?.solved) {
      launchConfetti()

      if (user.authenticated && user.balance < parseEther(".01")) {
        const res = await fetch("/api/drip", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (res.ok) {
          toastInfo("Nice win! We just sent .01 testnet ETH to your wallet.")
        }
      }
    }
  }

  const reset = async () => {
    wordleGameStates.reset(gameId, true)
  }

  let showRestart = $state(false)
</script>

<div class="flex flex-col gap-4 p-4">
  <GameHeader puzzle="wordle" onRestart={reset} />
  <OpponentDisplay opponent={null} />

  <Wordle
    {...game}
    onSubmitGuess={enterGuess}
    onGameOver={() => {
      showRestart = true
    }}
  />
</div>

<div class="flex w-full justify-center py-4">
  <button
    class="block rounded-lg bg-black p-2 font-semibold text-white md:hidden"
    onclick={(e) => {
      reset()
      showRestart = false
      if (e.target instanceof HTMLElement) {
        e.target.blur()
      }
    }}
  >
    Restart
  </button>
</div>
