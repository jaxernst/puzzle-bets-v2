<script lang="ts">
  import { ethPrice } from "$lib/ethPrice"
  import EthSymbol from "$lib/icons/EthSymbol.svelte"
  import { newGame } from "./newGame"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import ButtonPrimary from "$lib/components/ButtonPrimary.svelte"
  import { fade } from "svelte/transition"

  export let onConfirm: () => void

  let lockUsd = false
  let wagerUSD = 0
  $: if (!lockUsd) {
    wagerUSD = $newGame.wagerEth * $ethPrice
  }

  let inviteName: string | null = null

  function updateETH(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    if (isNaN(value)) return

    lockUsd = false
    newGame.setParam("wagerEth", value)
  }

  function updateUSD(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    if (isNaN(value)) return

    lockUsd = true
    newGame.setParam("wagerEth", value / $ethPrice)
  }

  function updateSubmissionWindow(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    newGame.setParam("submissionWindow", value)
  }

  function updateInviteExpiration(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    newGame.setParam("inviteExpiration", value)
  }

  function updateInviteName(event: Event) {
    const value = (event.target as HTMLInputElement).value
    newGame.setParam("inviteName", value)
  }

  $: togglePassword = () => {
    if ($newGame.password) {
      newGame.setParam("password", undefined)
    } else {
      newGame.setRandomPassword()
    }
  }
</script>

<!-- Input fields -->
<div
  class="flex items-center justify-between px-2 py-2 text-neutral-400 sm:px-7"
>
  <label class="flex flex-col gap-1 text-neutral-200">
    <span class="text-sm text-neutral-400">Wager (USD)</span>
    <div class="flex items-center gap-1">
      <input
        type="number"
        min="0"
        step="1"
        class="w-[120px] rounded-lg bg-neutral-700 p-2"
        placeholder="15"
        value={wagerUSD}
        on:input={updateUSD}
      />
      <div class=" fill-neutral-300">$</div>
    </div>
  </label>

  <div class="pt-3">or</div>

  <label class="flex flex-col gap-1 text-neutral-200">
    <span class="text-sm text-neutral-400">Wager (ETH)</span>
    <div class="flex items-center gap-1">
      <input
        type="number"
        min="0"
        step="0.001"
        class="w-[120px] rounded-lg bg-neutral-700 p-2"
        placeholder="0.01"
        value={$newGame.wagerEth}
        on:input={updateETH}
      />
      <div class="h-4 w-4 fill-neutral-300">
        <EthSymbol />
      </div>
    </div>
  </label>
</div>

<div class="flex flex-col gap-3 px-6 py-2">
  <div class="text-neutral-400">
    Puzzle deadline:
    <input
      type="number"
      class="w-[50px] rounded-lg bg-neutral-700 px-2 text-neutral-200"
      min="1"
      max="100000"
      value={$newGame.submissionWindow}
      on:input={updateSubmissionWindow}
    /> minutes
  </div>

  <div class="text-neutral-400">
    Invite expires:
    <input
      type="number"
      class="w-[50px] rounded-lg bg-neutral-700 px-2 text-neutral-200"
      min="1"
      max="100000"
      value={$newGame.inviteExpiration}
      on:input={updateInviteExpiration}
    />
    minutes
  </div>

  <div class="flex items-center gap-2 text-neutral-400">
    Your name (optional):
    <input
      type="text"
      class="h-5 w-[130px] rounded-full bg-transparent px-3 text-neutral-200 outline outline-neutral-700"
      value={$newGame.inviteName ?? null}
      on:input={updateInviteName}
      on:input|preventDefault|stopPropagation
    />
  </div>

  <div class="flex items-center gap-2 text-neutral-400">
    Game visibility:
    <button on:click={togglePassword}>
      <div
        class={`relative flex h-5 w-[4.75rem] flex-none rounded-full transition-all duration-300 ${
          !$newGame.password
            ? "bg-neutral-700 outline outline-neutral-600"
            : "outline outline-neutral-700"
        }`}
      >
        {#if !$newGame.password}
          <div
            transition:fade={{ duration: 150 }}
            class="absolute h-5 pl-2 text-sm"
          >
            <div class="flex h-full items-center">Public</div>
          </div>
        {:else}
          <div
            transition:fade={{ duration: 150 }}
            class="absolute h-5 w-full pr-2 text-sm"
          >
            <div class="flex h-full w-full items-center justify-end">
              Private
            </div>
          </div>
        {/if}
        <div
          class={`m-[.12rem] h-4 w-4 rounded-full bg-lime-500 transition-all ${
            !$newGame.password ? "translate-x-14" : ""
          }`}
        ></div>
      </div>
    </button>
  </div>
</div>

<ButtonPrimary class="self-end whitespace-nowrap" on:click={onConfirm}>
  <AnimatedArrow direction="right" class="w-5 fill-white stroke-white" />
</ButtonPrimary>
