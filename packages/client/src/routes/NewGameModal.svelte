<script context="module" lang="ts">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import Lock from "$lib/icons/Lock.svelte"
  import Smiley from "$lib/icons/Smiley.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"

  let show = $state(false)

  export const openNewGameModal = () => {
    show = true
  }

  let puzzleType: PuzzleType = $state("wordle")

  let visibility: "public" | "private" = $state("public")

  let usdValue = 2
  let selectedCurrency = $state<"USD" | "ETH">("USD")
  let selectedCurrencySymbol = $derived(
    { USD: "$", ETH: "E" }[selectedCurrency],
  )
</script>

<Modal bind:show>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2 font-extrabold">
      <Stars />
      Create Game
    </div>

    <div class="font-extrabold">New {capitalized(puzzleType)} Game</div>

    <div class="flex flex-col gap-2">
      <div class="text-[11px]">Choose Game Visibility</div>

      <div class="flex items-center text-[13px] font-extrabold">
        <button
          class={`flex w-full flex-col items-center gap-1 rounded-l-lg border-2 border-black p-4 transition-colors ${
            visibility === "public" ? "bg-black text-white" : ""
          }`}
          onclick={() => (visibility = "public")}
        >
          <Smiley class={visibility === "public" ? "invert" : ""} />
          <div>Public Game</div>
        </button>

        <button
          class={`flex w-full flex-col items-center gap-1 rounded-r-lg border-2 border-l-0 border-black p-4 transition-colors ${
            visibility === "private" ? "bg-black text-white" : ""
          }`}
          onclick={() => (visibility = "private")}
        >
          <Lock class={visibility === "private" ? "" : "invert"} />
          <div>Private Game</div>
        </button>
      </div>

      <div>
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

      <div class="flex w-full items-center rounded bg-[#E7E1D2] pl-3 font-bold">
        Wordle
        <div class="ml-2">|</div>
        <input
          class="flex-grow bg-transparent px-2 py-3"
          placeholder="Game Name"
        />
      </div>
    </div>

    <!-- Game Wager -->
    <div>
      <div class="mb-2 text-[11px]">Wager</div>

      <div class="flex gap-2">
        <div
          class="flex w-full items-center rounded bg-[#E7E1D2] pl-3 font-bold"
        >
          {selectedCurrencySymbol}
          <div class="ml-2">|</div>
          <input
            class="flex-grow bg-transparent px-2 py-3"
            placeholder="Game Name"
            type="number"
            value="2.00"
          />
        </div>

        <button
          class="flex items-center gap-1 whitespace-nowrap rounded border-2 border-black p-3 text-sm font-bold leading-none"
          onclick={() => {
            if (selectedCurrency === "USD") {
              selectedCurrency = "ETH"
            } else {
              selectedCurrency = "USD"
            }
          }}
        >
          {selectedCurrency} ({selectedCurrencySymbol})

          <AnimatedArrow
            direction={selectedCurrency === "USD" ? "down" : "up"}
            class="h-4 w-4"
          />
        </button>
      </div>
    </div>
  </div>
</Modal>
