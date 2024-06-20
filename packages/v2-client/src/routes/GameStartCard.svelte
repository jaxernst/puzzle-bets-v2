<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"

  export let game: PuzzleType
  export let disabled = false
</script>

<div class="flex w-[280px] overflow-hidden rounded-lg">
  <div
    class="bg-pb-yellow flex aspect-square h-full items-center justify-center"
  >
    <div class="p-3 font-mono text-3xl font-bold uppercase">
      {game[0]}
    </div>
  </div>

  <div class="bg-pb-off-white flex flex-grow flex-col gap-2 p-3">
    <div class="text-lg font-bold">{capitalized(game)}</div>

    <div class="text-pb-off-white text-sm font-semibold">
      {#if !disabled}
        <a
          href="/games/wordle"
          class="self-start rounded-md bg-black p-2 text-white"
        >
          Start game
        </a>
      {:else}
        <button class="bg-pb-gray-2 self-start rounded-md p-2">
          Coming soon...
        </button>
      {/if}
    </div>
  </div>
</div>
