<script lang="ts">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"

  let { gameId, puzzle } = $props<{ gameId?: string; puzzle: PuzzleType }>()
</script>

<div class="flex w-full justify-center">
  <div class="flex max-w-[1000px] flex-grow justify-between">
    <div class="flex items-center">
      <AnimatedArrow class="h-6 w-6" direction={"left"} />

      {#if gameId}
        <button
          onclick={() => window.history.back()}
          class="font-bold hover:underline">{capitalized(puzzle)} | Live</button
        >
      {:else}
        <button
          onclick={() => window.history.back()}
          class="font-bold hover:underline"
          >Practice {capitalized(puzzle)}</button
        >
      {/if}
    </div>

    <div class="flex items-center gap-1 text-sm">
      <div class="rounded-full bg-black px-1.5 py-0.5 text-white">$0 Wager</div>
      <div class="rounded-full bg-black px-1.5 py-0.5 text-white">
        No time limit
      </div>
    </div>
  </div>
</div>
