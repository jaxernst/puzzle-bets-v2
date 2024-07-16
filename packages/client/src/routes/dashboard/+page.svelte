<script lang="ts">
  import { goto } from "$app/navigation"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import Star from "$lib/icons/Star.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import type { PuzzleType } from "$lib/types"
  import { user } from "$lib/userStore.svelte"
  import { capitalized, shortenAddress } from "$lib/util"
  import GameController from "../GameController.svelte"

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

  let displayName = user.displayName ?? user.address ?? "Guest"
</script>

<div class="flex h-full w-full flex-col overflow-visible">
  <div class="relative -z-10 h-[150px] w-full">
    <img
      class="h-full w-full object-cover"
      src="/character2-spotlight.png"
      alt="Background puzzle character"
    />

    <div
      class="absolute top-0 flex h-full w-full flex-col gap-2 bg-black/50 p-4 pb-6"
    >
      <div class="font-angkor text-xl font-extrabold text-white">
        Update 0.1
      </div>

      <div class="flex-grow text-sm text-white">
        We've overhauled everything to be smoother, simpler, and introduced a
        new design!
      </div>

      <div class="flex items-center gap-1 text-xs text-white">
        Release Notes
        <AnimatedArrow direction="right" class="h-3 w-3 fill-white" />
      </div>
    </div>
  </div>

  <div
    class="-mt-2 flex flex-grow flex-col gap-6 rounded-t-lg bg-white p-4 md:rounded-t-xl"
  >
    <div class="flex items-center gap-2">
      <Star />
      <div class="font-extrabold">Welcome {displayName}</div>
    </div>

    {#if user.address}
      <!-- User Stats -->
    {:else}
      <div class="text-base leading-tight">
        Connect your wallet to play live games with friends. Otherwise, you can
        sharpen your puzzle skills by playing solo practice games
      </div>
    {/if}

    <hr />
  </div>

  <GameController />
</div>
