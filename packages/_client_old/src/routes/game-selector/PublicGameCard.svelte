<script lang="ts">
  import { ethPrice } from "$lib/ethPrice"
  import { getGame, liveGameStatus } from "$lib/gameStores"
  import { GameStatus, type Game, type PuzzleType } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatAsDollar,
    shortenAddress,
    systemTimestamp,
  } from "$lib/util"
  import type { Entity } from "@latticexyz/recs"
  import { formatEther, parseEther } from "viem"
  import ButtonPrimary from "$lib/components/ButtonPrimary.svelte"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"

  export let game: Game

  $: ({ id, type } = game)

  $: joinGameRoute = (id: Entity, gameType: PuzzleType) => {
    return `/join/${parseInt(id, 16)}`
  }

  $: betAmount = (id: string) => {
    const ethValue = Number(
      formatEther($getGame(id as Entity)?.buyInAmount ?? 0n),
    )

    return formatAsDollar(ethValue * $ethPrice)
  }

  $: liveStatus = liveGameStatus(id)
</script>

<a
  class="relative flex w-full flex-col justify-between self-start rounded-md bg-neutral-700 px-2 py-1 transition-all"
  href={joinGameRoute(id, type)}
>
  <div class="flex items-center justify-between gap-6">
    <div class="text-pb-yellow text-xs">
      #{entityToInt(id)}
    </div>
    <div class="text-sm text-lime-500">
      {betAmount(id)}
    </div>
  </div>
  <div
    class="flex items-center justify-center gap-1 p-1 pt-0 font-mono text-base"
  >
    {capitalized(type)}
  </div>
  <div
    class="flex justify-between whitespace-nowrap text-xs italic tracking-wider text-neutral-400"
  >
    With {shortenAddress(game.p1)}
  </div>
  <ButtonPrimary class="absolute bottom-2 right-2 rounded p-1">
    <AnimatedArrow direction="right" class="h-4 w-4 fill-white stroke-white" />
  </ButtonPrimary>
</a>
