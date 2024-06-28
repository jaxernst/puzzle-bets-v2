<script lang="ts">
  import { goto } from "$app/navigation"
  import type { PuzzleType } from "$lib/types"
  import { user } from "$lib/userStore.svelte"
  import { capitalized, shortenAddress } from "$lib/util"
  import { openControls, showControls } from "../GameController.svelte"

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
        Play
      {/if}
    </button>
  </div>
{/snippet}

<div
  class="start mx-auto flex min-h-[600px] w-full max-w-[850px] flex-col items-center px-4"
>
  <!-- Welcome -->
  <div class="p-10">
    <h1 class="font-angkor text-2xl font-bold">
      Welcome {user.address ? shortenAddress(user.address) : "Guest"}
    </h1>

    <div class=" flex justify-center p-4">
      <button class="rounded-full border border-black px-3 py-1 text-sm"
        >Set display name</button
      >
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex w-full flex-col items-center gap-6 self-start">
    <div class="font-angkor text-2xl">Play Live</div>

    <div class="flex gap-3">
      <button class="rounded-lg bg-black px-4 py-2 font-bold text-white">
        Start a New Game
      </button>

      <button
        onclick={(e) => {
          e.stopImmediatePropagation()
          openControls("lobby")
        }}
        class="rounded-md border-2 border-black p-4 font-bold"
      >
        Join a Public Game
      </button>
    </div>
  </div>

  <!-- Choose Your Game -->
  <div
    class="flex h-full flex-col items-center justify-center gap-6 self-start pt-10"
  >
    <div class="font-angkor text-2xl">Practice</div>

    <div
      class="flex w-full max-w-[800px] flex-wrap items-center justify-center gap-4"
    >
      {@render card("wordle", false)}

      {#each ["connections", "sudoku", "crossword"] as gameName}
        {@render card(gameName as PuzzleType, true)}
      {/each}
    </div>
  </div>

  <!-- <div class="px-4 font-bold">
      Start a Live Game

      <div class="flex flex-wrap items-center justify-center gap-4 p-4">
        {@render card("Wordle", false)}

        {#each ["Connections", "Soduko", "Crossword"] as gameName}
          {@render card(gameName, true)}
        {/each}
      </div>
    </div> -->
</div>
