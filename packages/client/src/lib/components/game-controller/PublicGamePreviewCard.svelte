<script lang="ts">
  import { type Game } from "$lib/types"
  import {
    capitalized,
    entityToInt,
    formatAsDollar,
    formatSigFig,
    shortenAddress,
    formatTimeAbbr,
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
    <div class="flex items-center justify-between gap-1">
      <div class="flex items-center gap-1.5">
        <img
          alt="Player Avatar"
          src={"/avatar-1.png"}
          class="h-[26px] w-[26px]"
        />
        <div class="flex flex-col gap-1 overflow-hidden">
          <div
            class="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap font-bold"
          >
            {creatorDisplayName}
          </div>
          <div class="whitespace-nowrap">{shortenAddress(game.p1)}</div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2">
        <div class="flex flex-col items-end">
          <div class="flex gap-1 overflow-hidden font-bold">
            <div>
              {formatAsDollar(
                Number(formatEther(game.buyInAmount)) * prices.eth,
              )}
            </div>
            <div class="whitespace-nowrap text-[#8F8F8F]">
              ({formatSigFig(Number(formatEther(game.buyInAmount)), 2)} ETH)
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-xs text-[#757575]">Puzzle Deadline</div>
          <div class="font-bold">
            {formatTimeAbbr(game.submissionWindow)}
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
