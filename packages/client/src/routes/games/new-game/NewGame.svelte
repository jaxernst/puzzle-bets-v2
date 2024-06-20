<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"
  import InputPage from "./NewGameInputs.svelte"
  import ConfirmPage from "./NewGameConfirm.svelte"
  import { newGame } from "./newGame"
  import { onDestroy, onMount } from "svelte"
  import { ethPrice } from "$lib/ethPrice"

  export let puzzleType: PuzzleType
  $: newGame.setParam("puzzleType", puzzleType)

  onMount(() => {
    // Default eth wager to a prefixed usd amount
    newGame.setParam("wagerEth", 2.5 / $ethPrice)

    // Default to a password protected game
    newGame.setRandomPassword()
  })

  let showConfirm = false

  onDestroy(newGame.reset)
</script>

<div
  class="flex max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-4 sm:p-5"
>
  <div class="font-semibold">
    {#if showConfirm}
      Confirm your <span class="text-lime-500">{capitalized(puzzleType)}</span> game
      details
    {:else}
      Create a new <span class="text-lime-500">{capitalized(puzzleType)}</span> game
    {/if}
  </div>

  {#if showConfirm}
    <div class="text-sm">
      This action will deposit your wager and create a new Puzzle Bet. You may
      cancel and withdraw up until your opponent joins.
    </div>
    <ConfirmPage onCancel={() => (showConfirm = false)} />
  {:else}
    <ul class="ml-4 list-disc">
      <li>Choose your wager and bet parameters</li>
      <li>Invite a friend to your game or post it to the public lobby</li>
      <li>Solve the Wordle in the fewest tries to win!</li>
    </ul>
    <InputPage onConfirm={() => (showConfirm = true)} />
  {/if}
</div>
