<script lang="ts">
  import { goto } from "$app/navigation"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import type { PuzzleType } from "$lib/types"
  import { user } from "$lib/userStore.svelte"
  import { capitalized, shortenAddress } from "$lib/util"
  import {
    hideControls,
    openControls,
    showControls,
  } from "../GameController.svelte"
  import { openNewGameModal } from "../NewGameModal.svelte"

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

<div class="flex h-full w-full flex-col overflow-visible">
  <div class="relative h-[150px] w-full">
    <img
      class="h-full w-full object-cover"
      src="/character2-spotlight.png"
      alt="Background puzzle character"
    />

    <div class="absolute top-0 h-full w-full bg-black/40"></div>
  </div>

  <div class="z-10 -mt-2 flex-grow rounded-t-lg bg-white"></div>
</div>
