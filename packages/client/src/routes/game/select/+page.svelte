<script lang="ts">
  import { goto } from "$app/navigation"
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"
  import { showControls } from "../../game-controller/GameController.svelte"

  $effect(showControls)

  const gameInfo: Record<
    PuzzleType,
    { description: string; tag: null | string }
  > = {
    wordle: {
      description: "Guess the hidden word with clues to help.",
      tag: "4 Games Played",
    },
    sudoku: {
      description: "Fill the grid so each row, column, and box has 1 to 9.",
      tag: "Coming Soon",
    },
    crossword: {
      description: "Fill the grid with words that match given clues.",
      tag: "Coming Soon",
    },
    connections: {
      description: "Group words based on shared themes.",
      tag: "Coming Soon",
    },
  }
</script>

{#snippet card(puzzle: PuzzleType, disabled: boolean = false)}
  <div class="flex flex-col gap-3 rounded-md bg-white p-4">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between font-bold">
        <h1 class="text-lg font-extrabold">
          {capitalized(puzzle)}
        </h1>

        <div class="bg-pb-yellow rounded-full px-2 py-1 text-xs">
          {gameInfo[puzzle].tag}
        </div>
      </div>

      <div class="w-[311px]">
        {gameInfo[puzzle].description}
      </div>
    </div>

    <button
      {disabled}
      class="disabled:bg-pb-silver w-[311px] rounded-md bg-black py-2 font-bold text-white"
      onclick={() => goto(`/game/${puzzle.toLowerCase()}/practice`)}
    >
      {#if gameInfo[puzzle].tag === "Coming Soon"}
        Coming Soon
      {:else}
        View Lobby
      {/if}
    </button>
  </div>
{/snippet}

<div class="flex h-full flex-col items-center justify-center gap-6">
  <div class="font-angkor text-2xl">Choose your Game.</div>

  <div
    class="flex w-full max-w-[800px] flex-wrap items-center justify-center gap-4"
  >
    {@render card("wordle", false)}

    {#each ["connections", "sudoku", "crossword"] as gameName}
      {@render card(gameName as PuzzleType, true)}
    {/each}
  </div>
</div>
