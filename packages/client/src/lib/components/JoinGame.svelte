<script lang="ts">
  import { mud } from "$lib/mudStore.svelte"
  import {
    capitalized,
    entityToInt,
    formatAsDollar,
    formatSigFig,
    formatTime,
    shortenAddress,
  } from "$lib/util"
  import { formatEther } from "viem"
  import { type Game } from "$lib/types"
  import { displayNameStore } from "$lib/displayNameStore.svelte"
  import type { EvmAddress } from "$lib"
  import Clock from "$lib/icons/Clock.svelte"
  import { prices } from "$lib/prices.svelte"
  import { goto } from "$app/navigation"
  import DotLoader from "$lib/components/DotLoader.svelte"

  let { game, inviteTimeRemaining } = $props<{
    game: Game
    inviteTimeRemaining: number
  }>()

  let gameType = $derived(game?.type)

  let joinGameLoading = $state(false)
  const joinGame = async () => {
    if (!mud.systemCalls) return

    const pw = new URLSearchParams(window.location.search).get("pw")

    // TODO: Display proper error when password is incorrect
    joinGameLoading = true

    await mud.systemCalls.joinGame(
      game.id,
      Number(formatEther(game?.buyInAmount)),
      pw ?? undefined,
    )

    joinGameLoading = false

    fetch(`/api/notifications/${game.p1}/notify-game-joined`, {
      method: "POST",
    })

    goto(`/game/${game.type}/${entityToInt(game.id)}`)
  }

  let gameWagerEth = $state(Number(formatEther(game?.buyInAmount ?? 0n)))
  let gameWagerUsd = $derived(gameWagerEth * prices.eth)
  let creatorAddress = shortenAddress(game.p1) as EvmAddress
  let creatorName = $derived(displayNameStore.get(game.p1, false))
</script>

{#if game && gameType}
  <div class="font-bold">
    {capitalized(gameType)} Game #{entityToInt(game.id)}
  </div>

  <div class="text-base font-medium">
    Solve the Wordle in the fewest attempts to win.
  </div>

  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2 text-base">
      <img src={"/avatar-1.png"} class="h-[28px] w-[28px]" alt="Avatar" />

      {#if creatorName}
        <div>
          With <span class="font-bold">{creatorName}</span>
          <div class="leading-normal">{creatorAddress}</div>
        </div>
      {:else}
        With <span class="font-bold">{creatorAddress}</span>
      {/if}
    </div>

    <div class="flex flex-col">
      <div class="self-end text-sm">Wager to match</div>
      <div class="text-base leading-normal">
        <span class="font-bold">{formatAsDollar(gameWagerUsd)}</span> / {formatSigFig(
          gameWagerEth,
          2,
        )} eth
      </div>
    </div>
  </div>

  <div class="flex items-center gap-2">
    <div class="text-base font-black">Puzzle Due in</div>
    <div
      class="bg-pb-yellow flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold"
    >
      <Clock />
      {formatTime(game.submissionWindow)}
    </div>
  </div>

  <hr />

  <div class="flex flex-col gap-2">
    <button
      onclick={joinGame}
      disabled={joinGameLoading}
      class="flex justify-center rounded bg-black p-2 font-bold text-white"
    >
      {#if joinGameLoading}
        <DotLoader class="fill-white" />
      {:else}
        Join and Start Puzzle
      {/if}
    </button>

    <button
      onclick={() => goto("/dashboard")}
      class="rounded border-2 border-black p-2 text-center font-bold"
    >
      Cancel
    </button>

    <div class="text-center text-sm">
      This action will deposit your wager into a smart contract. You can't
      cancel or withdraw until the game is completed.
    </div>

    <div class="text-center text-sm">
      Invite expires in {formatTime(inviteTimeRemaining)}
    </div>

    <div class="text-center text-sm">
      A 2.5% protocol fee will be applied to the winner's payout.
    </div>
  </div>

  <!-- <div class="flex max-w-[450px] flex-col">
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
  </div> -->
{/if}
