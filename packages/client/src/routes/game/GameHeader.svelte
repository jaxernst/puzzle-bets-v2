<script lang="ts">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { prices } from "$lib/prices.svelte"
  import type { Game, PuzzleType } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatAsDollar,
    formatTimeAbbr,
  } from "$lib/util"
  import { formatEther } from "viem"

  let { game, puzzle } = $props<{ game?: Game; puzzle: PuzzleType }>()

  let betAmountDollar = game
    ? Number(formatEther(game.buyInAmount)) * prices.eth
    : 0

  let timeLimit = game ? game.submissionWindow : 0
</script>

<div class="flex w-full justify-center">
  <div class="flex max-w-[1000px] flex-grow justify-between">
    <button
      class="flex w-full items-center text-base font-semibold"
      onclick={() => window.history.back()}
    >
      <AnimatedArrow
        class="h-6 w-6 transition-transform group-hover:scale-125"
        direction={"left"}
      />

      {#if game}
        <div class="font-bold md:text-xl">
          {capitalized(puzzle)} | #{entityToInt(game.id)}
        </div>
      {:else}
        <div class="font-bold md:text-xl">
          Practice {capitalized(puzzle)}
        </div>
      {/if}
    </button>

    <div class="flex items-center gap-1 whitespace-nowrap">
      <div class="rounded-full bg-black p-2 text-base text-white">
        {formatAsDollar(betAmountDollar)} Wager
      </div>
      <div class="rounded-full bg-black p-2 text-base text-white">
        {#if timeLimit === 0}
          No time limit
        {:else}
          {formatTimeAbbr(timeLimit)}
        {/if}
      </div>
    </div>
  </div>
</div>
