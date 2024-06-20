<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { getGame, liveGameStatus } from "$lib/gameStores"
  import { mud } from "$lib/mud/mudStore"
  import { ethPrice } from "$lib/ethPrice"
  import {
    capitalized,
    formatAsDollar,
    formatSigFig,
    formatTime,
    shortenAddress,
  } from "$lib/util"
  import { type Entity } from "@latticexyz/recs"
  import { createEventDispatcher, onMount } from "svelte"
  import { slide } from "svelte/transition"
  import { cubicInOut } from "svelte/easing"
  import { formatEther } from "viem"

  export let gameId: Entity

  $: game = $getGame(gameId)
  $: gameType = game?.type

  const dispatch = createEventDispatcher()

  let joinGameLoading = false
  const joinGame = async () => {
    if (!game || !$mud.systemCalls) return

    const pw =
      new URLSearchParams(window.location.search).get("pw") ?? undefined

    // TODO: Display proper error when password is incorrect
    joinGameLoading = true
    try {
      await $mud.systemCalls.joinGame(
        gameId,
        Number(formatEther(game?.buyInAmount)),
        pw,
      )

      dispatch("joined")

      fetch(`/api/notifications/${game.p1}/notify-game-joined`, {
        method: "POST",
      })
    } finally {
      joinGameLoading = false
    }
  }

  $: liveStatus = liveGameStatus(gameId)
  $: buyIn = Number(formatEther(game?.buyInAmount ?? 0n))
</script>

{#if game && gameType}
  <div class="flex max-w-[450px] flex-col">
    <div class="font-semibold">
      Join <span class="text-lime-500">{capitalized(gameType)}</span> Game #{parseInt(
        gameId,
        16,
      )}
    </div>

    {#if $liveStatus?.inviteTimeLeft !== undefined}
      <div
        class="min-w-[270px] whitespace-nowrap italic text-neutral-400"
        in:slide={{ axis: "x", easing: cubicInOut }}
      >
        Invite expires in {formatTime($liveStatus.inviteTimeLeft)}...
      </div>
    {/if}

    {#if gameType === "wordle"}
      <ul class="flex list-disc flex-col gap-2 px-4 pb-2 pt-4 text-sm">
        <li>Solve the wordle in the fewest amount of tries to win</li>
      </ul>
    {/if}

    <div class="px-2 py-4 text-sm">
      <div
        class="grid grid-cols-[1fr_auto] gap-1 rounded-md bg-neutral-700 p-3 text-sm sm:text-base"
      >
        <div class="">Game Creator</div>
        <div class="">{shortenAddress(game.p1)}</div>

        <div class="">Bet Amount</div>
        <div class="">
          {#if $ethPrice}
            {formatSigFig(buyIn, 3)} eth ({formatAsDollar(buyIn * $ethPrice)} USD)
          {:else}
            {formatEther(game.buyInAmount)} eth
          {/if}
        </div>

        <div class="">Solution Deadline</div>
        <div class="">
          {Math.round(game.submissionWindow / 60)}<span>{" "}minutes</span>
        </div>
      </div>
      <div class="pt-1 text-xs italic text-neutral-500">
        ** A 2.5% protocol fee will be applied the winners' payout
      </div>
    </div>

    <div class="mt-2 flex justify-center px-4">
      {#key joinGameLoading}
        <button
          in:slide={{ axis: "x" }}
          class="whitespace-nowrap rounded-lg bg-lime-500 p-2 font-semibold text-white transition-all hover:bg-lime-400 hover:shadow"
          on:click={joinGame}
        >
          {#if joinGameLoading}
            <DotLoader />
          {:else}
            Join to Reveal Puzzle
          {/if}
        </button>
      {/key}
    </div>
  </div>
{/if}
