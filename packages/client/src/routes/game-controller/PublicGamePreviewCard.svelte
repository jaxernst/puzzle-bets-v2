<script lang="ts">
  import { type Game } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatAsDollar,
    formatSigFig,
    shortenAddress,
  } from "$lib/util"
  import { displayNameStore } from "$lib/displayNameStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { goto } from "$app/navigation"
  import { formatEther } from "viem"
  import { prices } from "$lib/prices.svelte"

  let { game } = $props<{ game: Game }>()

  let creatorDisplayName = $derived(displayNameStore.get(game.p1, false))

  let isUserGame = $derived(user.address === game.p1)
</script>

<div
  class="mb-[5px] flex w-[343px] flex-col gap-3 rounded bg-white p-4 text-[13px] leading-none"
  style={"box-shadow: 0px 5px 0px 0px #E3DDCD;"}
>
  <div class="flex items-center justify-between">
    <div>
      #{entityToInt(game.id)}
      <div class="font-bold">{capitalized(game.type)}</div>
    </div>

    <div
      class="bg-pb-yellow rounded-full px-[7px] py-[5px] text-[10px] font-bold leading-none"
    >
      Open
    </div>
  </div>

  <div class="flex flex-col">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <img
          alt="Player Avatar"
          src={"/avatar1.png"}
          class="h-[26px] w-[26px]"
        />
        <div class="flex flex-col gap-1">
          <div class="font-bold">{creatorDisplayName}</div>
          <div>{shortenAddress(game.p1)}</div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-1">
        <div class="text-xs text-[#757575]">Amount to Bet</div>
        <div class="flex gap-1 font-bold">
          <div>
            {formatAsDollar(Number(formatEther(game.buyInAmount)) * prices.eth)}
          </div>
          <div class="text-[#8F8F8F]">
            ({formatSigFig(Number(formatEther(game.buyInAmount)))} ETH)
          </div>
        </div>
      </div>
    </div>
  </div>

  <button
    class="self-stretch rounded bg-black p-3 text-center text-base font-bold text-white disabled:opacity-40"
    onclick={() => goto(`/join/${entityToInt(game.id)}`)}
    disabled={isUserGame}
  >
    {#if isUserGame}
      Your Game - Waiting for opponent
    {:else}
      Join
    {/if}
  </button>
</div>
