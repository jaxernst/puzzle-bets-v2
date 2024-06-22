<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"

  let { gameId, puzzle } = $props<{ gameId?: string; puzzle: PuzzleType }>()
</script>

<div class="flex justify-between">
  {#if gameId}
    <div class="font-bold">{capitalized(puzzle)} | Live</div>
  {:else}
    <div class="font-bold">Practice {capitalized(puzzle)}</div>
  {/if}

  <div class="flex items-center gap-1 text-sm">
    <div class="rounded-full bg-black px-1.5 py-0.5 text-white">$0 Wager</div>
    <div class="rounded-full bg-black px-1.5 py-0.5 text-white">
      No time limit
    </div>
  </div>
</div>
