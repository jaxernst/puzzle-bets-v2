<script lang="ts">
  import { GameStatus, type PlayerGame } from "$lib/types"
  import {
    entityToInt,
    formatTimeAbbr,
    shortenAddress,
    formatAsDollar,
    formatSigFig,
    capitalized,
    timeRemaining,
    systemTimestamp,
  } from "$lib/util"
  import { getPlayerOutcomes } from "$lib/gameQueries"

  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import Clock from "$lib/icons/Clock.svelte"
  import { prices } from "$lib/prices.svelte"
  import { formatEther } from "viem"

  let { game } = $props<{ game: PlayerGame }>()

  let status = $derived(game.status)
  let buyInEth = $derived(Number(formatEther(game.buyInAmount)))
  let buyInUsd = $derived(formatAsDollar(buyInEth * prices.eth))

  let tick = $state(0)
  $effect(() => {
    const interval = setInterval(() => {
      tick += 1
    }, 1000)
    return () => clearInterval(interval)
  })

  let outcomes = $derived.by(() => {
    tick
    return getPlayerOutcomes(game)
  })

  let inviteTimeLeft = $state(
    game.status === GameStatus.Pending
      ? timeRemaining(game.inviteExpiration)
      : null,
  )

  let inviteExpired = $derived(
    game.status === GameStatus.Pending &&
      inviteTimeLeft !== null &&
      inviteTimeLeft <= 0,
  )

  let inviteTimer: NodeJS.Timer

  $effect(() => {
    if (game.status === GameStatus.Pending) {
      inviteTimer = setInterval(() => {
        inviteTimeLeft = timeRemaining(game.inviteExpiration)
      }, 1000)
    }

    return () => {
      clearInterval(inviteTimer)
    }
  })

  /**
   Status Indicator/Action pairs:
   - Invite Pending -> Waiting for opponent to join
   - Invite Expired -> Cancel Game
   - Opponent Started -> Start your turn
   - 8m 21s left -> Rejoin 
   - Won, Tie, Loss -> Show Results
   **/
</script>

{#snippet statusLabel()}
  {#if status === GameStatus.Pending}
    {#if inviteExpired}
      Invite Expired
    {:else}
      Invite Pending (expires in {formatTimeAbbr(inviteTimeLeft ?? 0)})
    {/if}
  {:else if status === GameStatus.Active}
    {#if outcomes.mySubmissionTimeLeft > 0}
      <div class="flex items-center gap-1">
        <Clock class="h-[14px] w-[14px]" />
        {formatTimeAbbr(outcomes.mySubmissionTimeLeft)}
      </div>
    {:else if game.opponentStartTime}
      Opponent Started
    {:else if outcomes.waitingForOpponentPlayback}
      Waiting for opponent
    {:else if outcomes.mySubmissionTimeLeft === 0}
      Out of time
    {/if}
  {:else if status === GameStatus.Inactive}
    Game Cancelled
  {/if}
{/snippet}

{#snippet actionButton()}
  {#if game.status !== GameStatus.Inactive}
    <a
      class="w-full rounded bg-black py-3 text-center text-base font-bold text-white"
      href={`/game/${game.type}/${entityToInt(game.id)}${outcomes.canViewResults ? "?results=true" : ""}`}
    >
      {#if status === GameStatus.Pending}
        {#if inviteExpired}
          Cancel Game
        {:else}
          View Game Page
        {/if}
      {:else if status === GameStatus.Active}
        {#if game.myStartTime}
          Rejoin
        {:else}
          Start Turn ({formatTimeAbbr(outcomes.myPlaybackTime)} left)
        {/if}
      {:else if outcomes.canViewResults}
        Show Results
      {/if}
    </a>
  {/if}
{/snippet}

<div
  class="bg-pb-off-white mb-[5px] flex w-[343px] flex-col gap-6 rounded-md p-4 text-[13px] leading-none"
  style="box-shadow: 0px 5px 0px 0px #E3DDCD;"
>
  <div class="flex justify-between">
    <div>
      #{entityToInt(game.id)}
      <div class="font-bold">Wordle</div>
    </div>

    <div>
      {#if outcomes.gameOutcome}
        <div
          class={`${
            outcomes.gameOutcome === "win"
              ? "bg-pb-green"
              : outcomes.gameOutcome === "lose"
                ? "bg-pb-orange"
                : "bg-pb-gray-1"
          } rounded-full px-[7px] py-[5px] text-[11px] font-bold leading-[11px]`}
        >
          {capitalized(outcomes.gameOutcome)}
        </div>
      {:else}
        <div
          class="bg-pb-yellow rounded-full px-[7px] py-[5px] text-[10px] font-bold leading-[10px]"
        >
          {@render statusLabel()}
        </div>
      {/if}
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

    <div></div>

    {@render actionButton()}
  </div>
</div>
