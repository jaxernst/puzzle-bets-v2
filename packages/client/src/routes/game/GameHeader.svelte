<script lang="ts">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"

  let { gameId, puzzle } = $props<{ gameId?: string; puzzle: PuzzleType }>()
</script>

<div class="flex w-full justify-center">
  <div class="flex max-w-[1000px] flex-grow justify-between">
    <button
      class="group flex items-center hover:underline"
      onclick={() => window.history.back()}
    >
      <AnimatedArrow
        class=" h-6 w-6 transition-transform group-hover:scale-125"
        direction={"left"}
      />

      {#if gameId}
        <div class="font-bold">
          {capitalized(puzzle)} | Live
        </div>
      {:else}
        <div class="font-bold">
          Practice {capitalized(puzzle)}
        </div>
      {/if}
    </button>

    <div class="flex items-center gap-1 text-sm">
      <div class="rounded-full bg-black px-1.5 py-0.5 text-white">$0 Wager</div>
      <div class="rounded-full bg-black px-1.5 py-0.5 text-white">
        No time limit
      </div>
    </div>
  </div>
</div>
