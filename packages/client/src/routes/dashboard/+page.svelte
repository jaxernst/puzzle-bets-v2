<script lang="ts">
  import { goto } from "$app/navigation"
  import Clock from "$lib/icons/Clock.svelte"
  import Coins from "$lib/icons/Coins.svelte"
  import Edit from "$lib/icons/Edit.svelte"
  import Star from "$lib/icons/Star.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import Trophy from "$lib/icons/Trophy.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { prices } from "$lib/prices.svelte"
  import { getPlayerStats } from "$lib/statsQueries"
  import type { PuzzleType } from "$lib/types"
  import { user } from "$lib/userStore.svelte"
  import { capitalized, shortenAddress, weiToDollarFormatted } from "$lib/util"
  import { toggleAboutModal } from "../AboutModal.svelte"
  import { toggleDisplayNameModal } from "../DisplayNameModal.svelte"
  import GameController, {
    openControls,
    showControls,
  } from "../game-controller/GameController.svelte"
  import { toggleNewGameModal } from "../NewGameModal.svelte"

  $effect(showControls)

  const gameInfo: Record<
    PuzzleType,
    { description: string; tag: null | string }
  > = {
    wordle: {
      description: "Guess the hidden word with clues to help.",
      tag: "4 Games Played",
    },
    sudoku: {
      description: "Fill the grid so each row, column, and box has 1 to 9.",
      tag: "Coming Soon",
    },
    crossword: {
      description: "Fill the grid with words that match given clues.",
      tag: "Coming Soon",
    },
    connections: {
      description: "Group words based on shared themes.",
      tag: "Coming Soon",
    },
  }

  let [displayName, canSetDisplayName] = $derived.by(() => {
    if (user.displayName) return [user.displayName, false]
    if (user.address) return [shortenAddress(user.address), true]
    return ["Guest", false]
  })

  let stats = $derived(
    user.address && mud.synced ? getPlayerStats(user.address, mud) : null,
  )
</script>

<div class="flex h-full w-full flex-col md:h-auto">
  <div class="relative -z-10 h-[90px] w-full md:hidden"></div>

  <div
    class="bg-pb-off-white flex h-full flex-grow flex-col rounded-t-xl py-5 sm:p-6 md:mx-auto md:mt-6 md:rounded-xl"
  >
    <div class="flex items-center gap-2 px-3">
      <Star />

      <div class="font-extrabold">
        Welcome {displayName}

        {#if !user.address}
          <div class="text-sm font-normal">
            Connect your wallet to play live wagered games with friends.
          </div>
        {/if}
      </div>

      {#if canSetDisplayName}
        <div class="flex flex-grow justify-end">
          <button
            onclick={toggleDisplayNameModal}
            class="flex items-center gap-1 rounded-full border bg-[#E7E1D2] px-1.5 py-1 text-xs font-bold sm:text-sm"
          >
            <Edit class="stroke-black" />
            Set Display Name
          </button>
        </div>
      {/if}
    </div>

    <hr class="mx-4 my-5 px-3" />

    <!-- User Stats -->
    <div class="flex flex-wrap gap-4 gap-y-3 self-center px-3 md:gap-4">
      <div class="flex flex-col items-start gap-2 sm:items-center">
        <div class="text-xs text-[#3f3f3f] sm:text-sm">Wallet Balance</div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2"
        >
          <Wallet class="h-[20px] w-[20px]" />

          <div>
            {#if user.address}
              <span class="font-bold">{user.balanceUsd}</span>
              <span>/ {user.balanceEth} ETH</span>
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-start gap-2 sm:items-center">
        <div class="text-xs text-[#3f3f3f] sm:text-sm">Win / Loss / Tied</div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2 font-bold"
        >
          <Trophy class="h-[21px] w-[20px]" />

          <div>
            {#if stats}
              {stats.numWins} / {stats.numLosses} / {stats.numTies}
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-start gap-2 sm:items-center">
        <div class="text-xs text-[#3f3f3f] sm:text-sm">
          Active Wagers / Games
        </div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2 font-bold"
        >
          <Clock class="h-[20px] w-[21px]" />

          <div>
            {#if stats}
              {weiToDollarFormatted(stats.activeWagerAmount, prices.eth)} / {stats.numActiveGames}
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-start gap-2 sm:items-center">
        <div class="text-xs text-[#3f3f3f] sm:text-sm">Total Bet / Won</div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2 font-bold"
        >
          <Coins class="h-[21px] w-[20px]" />

          <div>
            {#if stats}
              {weiToDollarFormatted(stats.totalBetAmount, prices.eth)} /
              {weiToDollarFormatted(stats.totalWonAmount, prices.eth)}
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>
    </div>

    <hr class="mx-4 mt-5 px-3" />

    <div class="w-full flex-grow overflow-y-auto px-3 pt-5">
      <div
        class="mx-auto flex h-full w-full max-w-[400px] flex-col items-stretch gap-4 self-stretch"
      >
        {#if user.address}
          <div class="flex justify-center gap-3">
            <button
              class="bg-pb-yellow w-1/2 rounded-md px-4 py-3 text-center font-bold"
              style="box-shadow: 0px 5px 0px 0px #DDAC00;"
              onclick={() => {
                toggleNewGameModal()
              }}>Create Game</button
            >
            <button
              class="bg-pb-yellow w-1/2 rounded-md px-4 py-3 text-center font-bold"
              style="box-shadow: 0px 5px 0px 0px #DDAC00;"
              onclick={(e) => {
                e.stopPropagation()
                openControls("lobby")
              }}>Join Public Game</button
            >
          </div>
        {/if}

        <button
          class={`rounded-md ${user.address ? "bg-[#E7E1D2]" : "bg-pb-yellow"} p-3 text-center font-bold`}
          style={user.address
            ? "box-shadow: 0px 5px 0px 0px #CCC3AC;"
            : "box-shadow: 0px 5px 0px 0px #DDAC00;"}
          onclick={() => goto("/game/wordle/practice")}
        >
          Practice Wordle
        </button>

        {@render comingSoonPlaceholder("Play Connections")}
        {@render comingSoonPlaceholder("Play Crossword")}
        {@render comingSoonPlaceholder("Play Sudoku")}

        <button
          class="rounded-md bg-[#E7E1D2] p-3 text-center font-bold"
          style="box-shadow: 0px 5px 0px 0px #CCC3AC;"
          onclick={toggleAboutModal}
        >
          What is Puzzle Bets?
        </button>
      </div>
      <div class="h-[75px] md:h-10"></div>
    </div>
  </div>
</div>

{#snippet comingSoonPlaceholder(label: string)}
  <div
    class="flex items-center justify-center gap-2 rounded-md bg-[#AAA8A1] p-3 font-bold opacity-70"
    style="box-shadow: 0px 5px 0px 0px #838076;"
  >
    {label}
    <div
      class="rounded-full bg-[#777671] px-2 py-1.5 text-[10px] font-normal leading-none text-white"
    >
      Coming soon
    </div>
  </div>
{/snippet}
