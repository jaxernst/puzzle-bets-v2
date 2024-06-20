<script lang="ts">
  import { page } from "$app/stores"
  import { ethPrice } from "$lib/ethPrice"
  import {
    getGame,
    liveGameStatus,
    userArchivedGames,
    userSolvedGame,
  } from "$lib/gameStores"
  import { user } from "$lib/userStore"
  import { GameStatus, type Game, type PuzzleType } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatAsDollar,
    systemTimestamp,
  } from "$lib/util"
  import type { Entity } from "@latticexyz/recs"
  import { formatEther, parseEther } from "viem"

  export let game: Game

  $: ({ id, type, status } = game)

  $: solved = $userSolvedGame(id, $user.address).submitted

  $: active = $page.params.gameId === parseInt(id, 16).toString()

  $: gameRoute = (id: Entity, gameType: PuzzleType) => {
    return `/games/${gameType}/${parseInt(id, 16)}`
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
  class={`flex w-full flex-col justify-between self-start rounded-md px-2 py-1 transition-all
          ${!active ? "bg-neutral-700" : "bg-lime-500"}
        `}
  href={gameRoute(id, type)}
>
  <div class="flex items-center justify-between gap-6">
    <div class={`text-xs ${active ? "text-white" : "text-pb-yellow"}`}>
      #{entityToInt(id)}
    </div>
    <div class={`text-sm ${active ? "text-white" : "text-lime-500"}`}>
      {betAmount(id)}
    </div>
  </div>
  <div
    class="flex items-center justify-center gap-1 p-1 pt-0 font-mono text-base"
  >
    {capitalized(type)}
  </div>
  <div
    class={`whitespace-nowrap text-xs italic tracking-wider 
          ${active ? "font-bold text-lime-700" : "text-neutral-400"}`}
  >
    {#if status === GameStatus.Pending}
      waiting for opponent...
    {:else if status === GameStatus.Complete}
      game complete...
    {:else if solved}
      successfully solved!
    {:else if status === GameStatus.Active}
      {#if ($liveStatus?.submissionTimeLeft ?? 0) > 0}
        waiting for submission...
      {:else}
        time's up...
      {/if}
    {:else if status === GameStatus.Inactive}
      game cancelled...
    {/if}
  </div>
</a>
