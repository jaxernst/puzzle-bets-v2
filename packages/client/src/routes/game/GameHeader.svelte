<script lang="ts">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { gameTimers } from "$lib/gameTimers.svelte"
  import { prices } from "$lib/prices.svelte"
  import { GameStatus, type PlayerGame, type PuzzleType } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatAsDollar,
    formatTimeAbbr,
    timeRemaining,
  } from "$lib/util"
  import { formatEther } from "viem"
  import GameSubmit from "./GameSubmit.svelte"
  import { user } from "$lib/userStore.svelte"

  let { game, puzzle } = $props<{ game?: PlayerGame; puzzle: PuzzleType }>()

  let betAmountDollar = game
    ? Number(formatEther(game.buyInAmount)) * prices.eth
    : 0

  let timers = $derived(gameTimers(game))

  let submissionTimeLeft = $derived(timers.submissionTimeLeft)
</script>

<div class="flex w-full justify-center">
  <div class="flex max-w-[1000px] flex-grow items-center gap-4">
    <button
      class="flex items-center text-base font-semibold"
      onclick={() => window.history.back()}
    >
      <div class="p-.5 bg-pb-beige-1 rounded-md">
        <AnimatedArrow
          class="h-6 w-6 transition-transform group-hover:scale-125"
          direction={"left"}
        />
      </div>
    </button>

    <div
      class="flex grow items-center justify-between gap-1 md:flex-col md:items-start"
    >
      {#if game}
        <div class="font-bold md:text-xl">
          {capitalized(puzzle)} | #{entityToInt(game.id)}
        </div>
      {:else}
        <div class="font-bold md:text-xl">
          Practice {capitalized(puzzle)}
        </div>
      {/if}

      <!-- Pill labels -->
      <div
        class="flex grow items-center justify-end gap-1 whitespace-nowrap md:justify-start"
      >
        <div class="rounded-full bg-black p-2 text-base text-white">
          {formatAsDollar(betAmountDollar)} Wager
        </div>
        <div class="rounded-full bg-black p-2 text-base text-white">
          {#if submissionTimeLeft === undefined}
            No time limit
          {:else if submissionTimeLeft === 0}
            Out of time
          {:else}
            {formatTimeAbbr(submissionTimeLeft)}
          {/if}
        </div>
      </div>
    </div>

    <div class="hidden grow justify-end md:flex">
      {#if user.address && game}
        <GameSubmit {game} user={user.address} />
      {:else}
        <button
          class="disabled:opacity-4 rounded bg-black px-6 py-2 font-black text-white opacity-70"
          disabled={true}
        >
          Submit Puzzle
        </button>
      {/if}
    </div>
  </div>
</div>
