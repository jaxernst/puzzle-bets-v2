<script lang="ts">
  import { GameStatus, type PlayerGame } from "$lib/types"
  import {
    entityToInt,
    formatTime,
    formatTimeAbbr,
    shortenAddress,
    timeRemaining as _timeRemaining,
    formatAsDollar,
    formatSigFig,
  } from "$lib/util"

  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import Clock from "$lib/icons/Clock.svelte"
  import { prices } from "$lib/prices.svelte"
  import { formatEther } from "viem"

  let { game } = $props<{ game: PlayerGame }>()

  let status = $derived(game.status)
  let turnStartTime = $derived(game?.myStartTime ?? 0)
  let buyInEth = $derived(Number(formatEther(game.buyInAmount)))
  let buyInUsd = $derived(formatAsDollar(buyInEth * prices.eth))

  let timeRemaining = $state<number | null>(null)
  let countdownInterval: NodeJS.Timer | undefined

  const startCountdown = () => {
    countdownInterval = setInterval(() => {
      timeRemaining = _timeRemaining(turnStartTime + game.submissionWindow)
      if (timeRemaining === 0) clearInterval(countdownInterval)
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = undefined
    }
  }

  $effect(() => {
    if (
      turnStartTime &&
      game.status === GameStatus.Active &&
      !countdownInterval
    ) {
      startCountdown()
    } else {
      stopCountdown()
    }

    return stopCountdown
  })

  /**
   Status Indicator/Action pairs:

   - Invite Pending -> Waiting for opponent to join
   - Opponent Started -> Start your turn
   - 8m 21s left -> Rejoin 
   - Won, Tie, Loss -> Show Results

   **/
</script>

{#snippet statusLabel()}
  {#if status === GameStatus.Pending}
    Invite Pending
  {:else if status === GameStatus.Active}
    <!--If we are player that joined, show the timer, else show start turn-->
    {#if turnStartTime && timeRemaining}
      <div class="flex items-center gap-1">
        <Clock class="h-[14px] w-[14px]" />
        {formatTimeAbbr(timeRemaining)}
      </div>
    {:else if !turnStartTime}
      Opponent Started
    {/if}
  {/if}
{/snippet}

{#snippet actionButton()}
  {#if status === GameStatus.Pending}
    <div
      class="bg-pb-gray-1 w-full rounded py-3 text-center text-base font-bold text-white"
    >
      View Game Page
    </div>
  {:else if status === GameStatus.Active && !turnStartTime}
    <button
      class="w-full rounded bg-black py-3 text-center text-base font-bold text-white"
    >
      Start Turn
    </button>
  {:else if status === GameStatus.Active && turnStartTime}
    <button
      class="w-full rounded bg-black py-3 text-center text-base font-bold text-white"
    >
      Rejoin
    </button>
  {:else if status === GameStatus.Complete}
    <button
      class="w-full rounded bg-black py-3 text-center text-base font-bold text-white"
    >
      ShowResults
    </button>
  {/if}
{/snippet}

<div
  class="flex w-[343px] flex-col gap-[10px] rounded-md bg-white p-4 text-[13px] leading-none"
  style={"box-shadow: 0px 5px 0px 0px #E3DDCD;"}
>
  <div class="flex justify-between">
    <div>
      #{entityToInt(game.id)}
      <div class="font-bold">Wordle</div>
    </div>

    <div>
      <div
        class="bg-pb-yellow rounded-full px-[7px] py-[5px] text-[10px] font-bold leading-[10px]"
      >
        {@render statusLabel()}
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center gap-2">
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1">
        <Avatar1 />
        <div>You</div>
      </div>

      <div class="font-extrabold">vs</div>

      <div class="flex items-center gap-1">
        <Avatar2 />
        <div>{game.opponent ? shortenAddress(game.opponent) : "Pending"}</div>
      </div>
    </div>

    <div class="flex items-center gap-1 font-bold">
      <div class="mr-1 text-xs font-normal text-[#5E5E5E]">Bet</div>
      <div>{buyInUsd}</div>
      <div class="text-[#8F8F8F]">
        ({formatSigFig(buyInEth, 5)} ETH)
      </div>
    </div>
  </div>

  {@render actionButton()}
</div>
