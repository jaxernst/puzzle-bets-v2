<script context="module" lang="ts">
  import Modal from "$lib/components/Modal.svelte"
  import { goto } from "$app/navigation"
  import Wallet from "$lib/icons/Wallet.svelte"

  let showDripGameModal = $state(false)

  export function toggleDripGameModal() {
    showDripGameModal = !showDripGameModal
  }
</script>

<script>
  import { user } from "$lib/userStore.svelte"
  import { parseEther } from "viem"

  let dripGameModalShown = false

  $effect(() => {
    const modalDismissed =
      localStorage.getItem("dripGameModalDismissed") === "true"

    if (
      !dripGameModalShown &&
      !modalDismissed &&
      user.authenticated &&
      user.balanceFetched &&
      user.balance < parseEther(".1")
    ) {
      toggleDripGameModal()
      dripGameModalShown = true
    }
  })

  function dismissModal() {
    toggleDripGameModal()
    localStorage.setItem("dripGameModalDismissed", "true")
  }
</script>

<Modal bind:show={showDripGameModal} class="sm:w-[375px]">
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Wallet />
      <span class="font-bold">Get Started with testnet ETH</span>
    </div>
  {/snippet}

  <p class="text-base font-bold">Looks like you're low on testnet funds!</p>

  <p class="text-sm leading-tight">
    You'll need some testnet ETH to play wagered games. Solve a practice Wordle
    and we'll send you some!
  </p>

  <hr />

  <div class="flex flex-col gap-2">
    <button
      class="justify-self-end rounded border-2 border-black bg-black p-2 font-semibold text-white"
      onclick={() => {
        goto("/game/wordle/practice")
        toggleDripGameModal()
      }}
    >
      Go To Practice Game
    </button>

    <button
      class="justify-self-end rounded border-2 border-black p-2 font-semibold text-black"
      onclick={dismissModal}
    >
      Dismiss
    </button>
  </div>
</Modal>
