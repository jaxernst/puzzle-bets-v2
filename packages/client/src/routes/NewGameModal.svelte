<script context="module" lang="ts">
  import HandUp from "$lib/assets/HandUp.svelte"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import Clock from "$lib/icons/Clock.svelte"
  import Lock from "$lib/icons/Lock.svelte"
  import Smiley from "$lib/icons/Smiley.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"

  let show = $state(false)
  let showConfirm = $state(false)

  export const toggleNewGameModal = () => {
    show = !show
  }

  const showConfirmModal = () => {
    show = false
    showConfirm = true
  }

  let ethPrice = 3000

  // Input params
  let puzzleType: PuzzleType = $state("wordle")
  let gameName = $state("Game #123")
  let visibility: "public" | "private" = $state("public")
  let currencyInput = $state("2.00")
  let selectedCurrency = $state<"USD" | "ETH">("USD")
  let inputTimeLimit = $state(10)

  let selectedCurrencySymbol = $derived(
    { USD: "$", ETH: "Ξ" }[selectedCurrency],
  )

  let otherCurrency = $derived(selectedCurrency === "ETH" ? "USD" : "ETH")
  let otherCurrencyValue = $derived(
    otherCurrency === "ETH"
      ? (Number(currencyInput) / ethPrice).toFixed(5)
      : (ethPrice * Number(currencyInput)).toFixed(5),
  )

  const toggleCurrency = (currentCurrency: string) => {
    if (currentCurrency === "USD") {
      // Convert to eth
      currencyInput = (Number(currencyInput) / ethPrice).toFixed(5)
      selectedCurrency = "ETH"
    } else {
      // Convert to USD
      currencyInput = (ethPrice * Number(currencyInput)).toFixed(5)
      selectedCurrency = "USD"
    }
  }

  let createGame = $derived(() => {
    let wagerEth = 0
    if (selectedCurrency === "ETH") {
      wagerEth = Number(currencyInput)
    } else {
      wagerEth = Number(currencyInput) / ethPrice
    }

    const inviteExpirationMin = visibility === "public" ? 60 * 24 * 3 : 60 * 24
    const password =
      visibility === "public"
        ? undefined
        : Math.random().toString(36).substring(2)

    mud.systemCalls?.newGame(
      puzzleType,
      wagerEth,
      inputTimeLimit,
      inviteExpirationMin,
      password,
    )
  })
</script>

<Modal bind:show class="px-6 pb-0 pt-6">
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2 text-sm font-extrabold">
      <Stars />
      Create Game
    </div>

    <div class="font-extrabold">New {capitalized(puzzleType)} Game</div>

    <!-- Game Visibility -->
    <div class="flex flex-col gap-2">
      <div class="text-[11px]">Choose Game Visibility</div>

      <div class="flex h-[62px] items-stretch text-[13px] font-extrabold">
        <button
          class={`flex w-full flex-col items-center gap-1 rounded-l-lg border-2 border-r-0 border-black px-4 py-2 transition-colors ${
            visibility === "public" ? "bg-black text-white" : ""
          }`}
          onclick={() => (visibility = "public")}
        >
          <Smiley class={visibility === "public" ? "invert" : ""} />
          <div>Public Game</div>
        </button>

        <button
          class={`flex w-full flex-col items-center gap-1 rounded-r-lg border-2 border-l-0 border-black px-4 py-2 transition-colors ${
            visibility === "private" ? "bg-black text-white" : ""
          }`}
          onclick={() => (visibility = "private")}
        >
          <Lock class={visibility === "private" ? "" : "invert"} />
          <div>Private Game</div>
        </button>
      </div>

      <div class="text-xs">
        {#if visibility === "public"}
          Anyone can join your game from the lobby
        {:else if visibility === "private"}
          Only people with your invite link can join
        {/if}
      </div>
    </div>

    <!-- Game Name -->
    <div class="">
      <div class="mb-2 text-[11px]">
        Game Name <span class="font-bold">(optional)</span>
      </div>

      <div
        class="flex w-full items-center rounded-md bg-[#E7E1D2] pl-3 font-bold"
      >
        Wordle
        <div class="ml-2">|</div>
        <input
          class="flex-grow bg-transparent px-2 py-3"
          placeholder="Game Name"
          bind:value={gameName}
        />
      </div>
    </div>

    <!-- Game Wager -->
    <div>
      <div class="mb-2 text-[11px]">Wager</div>

      <div class="flex gap-2">
        <div
          class="flex w-full items-center rounded-md bg-[#E7E1D2] pl-3 font-bold"
        >
          {selectedCurrencySymbol}
          <div class="ml-2">|</div>
          <input
            class="flex-grow bg-transparent px-2 py-3"
            placeholder="Game Name"
            type="number"
            min="0"
            bind:value={currencyInput}
          />
        </div>

        <button
          class="flex items-center gap-1 whitespace-nowrap rounded-md border-2 border-black p-3 font-bold"
          onclick={() => toggleCurrency(selectedCurrency)}
        >
          {selectedCurrency} ({selectedCurrencySymbol})

          <AnimatedArrow
            direction={selectedCurrency === "USD" ? "down" : "up"}
            class="h-4 w-4"
          />
        </button>
      </div>

      <div class="mt-2 text-[11px] leading-none text-black/50">
        {otherCurrencyValue}
        {otherCurrency}
      </div>
    </div>

    <!-- Puzzle Time Limit -->
    <div>
      <div class="mb-2 text-[11px]">Puzzle Time Limit</div>

      <div class="flex gap-2">
        {#each [10, 20, 30, 45] as timeLimit}
          {@const isSelected = inputTimeLimit === timeLimit}

          <button
            class={`rounded-md border-2 border-black p-3 py-2 font-bold
             ${isSelected ? "bg-black text-white" : "bg-white text-black"}
            `}
            onclick={() => (inputTimeLimit = timeLimit)}
          >
            {timeLimit} min
          </button>
        {/each}
      </div>
    </div>

    <hr class="my-2" />

    <div class="flex w-full flex-col gap-2 font-bold">
      <button
        onclick={showConfirmModal}
        class="rounded-md border-2 border-black bg-black py-2 text-white"
      >
        Create Game
      </button>

      <button
        class="rounded-md border-2 border-black py-2"
        onclick={toggleNewGameModal}
      >
        Cancel
      </button>

      <div class="text-center text-[12px] font-normal leading-tight">
        A 2.5% procotol fee will be applied to the winner's payout
      </div>
    </div>

    <HandUp />
  </div>
</Modal>

<Modal bind:show={showConfirm} class="px-6 pb-0 pt-6">
  <div class="flex flex-col gap-5">
    <div class="flex items-center gap-2 text-sm font-extrabold">
      <Stars />
      Confirm Create Game
    </div>

    <div class="font-extrabold">New {capitalized(puzzleType)} | {gameName}</div>

    <div class="flex flex-grow gap-6">
      <div class="flex flex-col gap-2">
        <div class="text-sm">Visibility</div>
        <div
          class="bg-pb-gray-1 flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-bold"
        >
          <Smiley class="h-[18px] w-[18px]" />
          {capitalized(visibility)} Game
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="text-sm">Wager</div>
        <div
          class="bg-pb-gray-1 flex items-center gap-1 rounded-full px-2 py-1 text-[13px]"
        >
          <Wallet class="h-[18px] w-[18px]" />
          <span class="font-bold">{selectedCurrencySymbol}{currencyInput}</span>
          /
          <span>{otherCurrencyValue} {otherCurrency}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="text-sm">Puzzle Time Limit</div>
      <div
        class="bg-pb-gray-1 flex items-center gap-1 self-start rounded-full px-2 py-1 text-[13px]"
      >
        <Clock class="h-[18px] w-[18px]" />
        <span class="font-bold">{inputTimeLimit} min</span>
      </div>
    </div>

    <hr class="my-2" />

    <div class="flex w-full flex-col gap-2 font-bold">
      <button
        onclick={createGame}
        class="rounded-md border-2 border-black bg-black py-2 text-white"
      >
        Confirm
      </button>

      <button
        class="rounded-md border-2 border-black py-2"
        onclick={() => {
          showConfirm = false
          show = true
        }}
      >
        Edit Details
      </button>

      <div
        class="max-w-[340px] text-center text-[12px] font-normal leading-tight"
      >
        This action will deposit your wager in the smart contract. You may
        cancel and withdraw up until your opponent joins.
      </div>
    </div>

    <div class="flex flex-grow items-end">
      <HandUp />
    </div>
  </div>
</Modal>
