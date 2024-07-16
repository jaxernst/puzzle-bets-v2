<script lang="ts">
  import { goto } from "$app/navigation"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import Clock from "$lib/icons/Clock.svelte"
  import Coins from "$lib/icons/Coins.svelte"
  import Star from "$lib/icons/Star.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import Trophy from "$lib/icons/Trophy.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import type { PuzzleType } from "$lib/types"
  import { user } from "$lib/userStore.svelte"
  import { capitalized, shortenAddress } from "$lib/util"
  import GameController, {
    hideControls,
    openControls,
    showControls,
  } from "../GameController.svelte"
  import { toggleNewGameModal } from "../NewGameModal.svelte"

  $effect(() => {
    showControls()
  })

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

  let walletBalanceUsd = "$32.00"
  let walletBalanceEth = "0.012"
  let activeWagerValUsd = "$30.00"
  let numActiveGames = 3
  let numWins = 12
  let numLoss = 2
  let numTied = 1
  let totalBetUsd = "$140.00"
  let totalWonUsd = "$90.00"
</script>

<div class="flex h-full w-full flex-col overflow-visible">
  <div class="relative -z-10 h-[150px] w-full">
    <img
      class="h-full w-full object-cover"
      src="/character2-spotlight.png"
      alt="Background puzzle character"
    />

    <div
      class="absolute top-0 flex h-full w-full flex-col gap-2 bg-black/50 p-4 pb-6"
    >
      <div class="font-angkor text-xl font-extrabold text-white">
        Update 0.1
      </div>

      <div class="flex-grow text-sm text-white">
        We've overhauled everything to be smoother, simpler, and introduced a
        new design!
      </div>

      <div class="flex items-center gap-1 text-xs text-white">
        Release Notes
        <AnimatedArrow direction="right" class="h-3 w-3 fill-white" />
      </div>
    </div>
  </div>

  <div
    class="bg-pb-off-white -mt-2 flex flex-grow flex-col gap-5 rounded-t-lg p-4 md:rounded-t-xl"
  >
    <div class="flex items-center gap-2">
      <Star />

      <div class="font-extrabold">Welcome {displayName}</div>

      {#if canSetDisplayName}
        <div class="flex flex-grow justify-end">
          <button
            onclick={() => {}}
            class="rounded-full border border-black/60 p-2 text-sm text-black/60"
          >
            Set Display Name
          </button>
        </div>
      {/if}
    </div>

    {#if !user.address}
      <div class="mb-1 text-base leading-tight">
        Connect your wallet to play live games with friends. Otherwise, you can
        sharpen your puzzle skills by playing solo practice games.
      </div>
    {/if}

    <!-- User Stats -->
    <div class="flex flex-wrap gap-6 gap-y-3 md:gap-8">
      <div class="flex flex-col items-start gap-2">
        <div class="text-sm text-[#3f3f3f]">Wallet Balance</div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2"
        >
          <Wallet class="h-[20px] w-[20px]" />

          <div>
            {#if user.address}
              <span class="font-bold">{walletBalanceUsd}</span>
              <span>/ {walletBalanceEth} ETH</span>
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-start gap-2">
        <div class="text-sm text-[#3f3f3f]">Win / Loss / Tied</div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2 font-bold"
        >
          <Trophy class="h-[21px] w-[20px]" />

          <div>
            {#if user.address}
              {numWins} / {numLoss} / {numTied}
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-start gap-2">
        <div class="text-sm text-[#3f3f3f]">Active Wagers / Games</div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2 font-bold"
        >
          <Clock class="h-[20px] w-[21px]" />

          <div>
            {#if user.address}
              {activeWagerValUsd} / {numActiveGames}
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-start gap-2">
        <div class="text-sm text-[#3f3f3f]">Total Bet / Won</div>
        <div
          class="text-md flex items-center gap-2 rounded-full bg-[#ccccccbf] px-3 py-2 font-bold"
        >
          <Coins class="h-[21px] w-[20px]" />

          <div>
            {#if user.address}
              {totalBetUsd} / {totalWonUsd}
            {:else}
              ---
            {/if}
          </div>
        </div>
      </div>
    </div>

    <hr class="my-1" />

    <div class="w-full max-w-[400px] self-center">
      <div class="flex max-w-[400px] flex-col items-stretch gap-4 self-stretch">
        {#if user.address}
          <div class="mb-2 flex justify-center gap-3">
            <button
              class="bg-pb-yellow rounded-md px-4 py-3 text-center font-bold"
              style="box-shadow: 0px 5px 0px 0px #DDAC00;"
              onclick={() => {
                toggleNewGameModal()
              }}>Create Game</button
            >
            <button
              class="bg-pb-yellow rounded-md px-4 py-3 text-center font-bold"
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
        >
          What is Puzzle Bets?
        </button>
      </div>
    </div>

    <div class="h-[60px]"></div>
  </div>
</div>

{#snippet comingSoonPlaceholder(label)}
  <div
    class="flex items-center justify-center gap-2 rounded-md bg-[#AAA8A1] p-3 font-bold"
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
