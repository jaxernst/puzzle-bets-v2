<script context="module" lang="ts">
  import Modal from "$lib/components/Modal.svelte"
  import { goto } from "$app/navigation"

  let showDripGameModal = $state(false)

  export function toggleDripGameModal() {
    showDripGameModal = !showDripGameModal
  }
</script>

<Modal bind:show={showDripGameModal} class="sm:w-[375px]">
  {#snippet header()}
    <div class="flex items-center gap-2">
      <span class="font-bold">Get Started with Testnet ETH</span>
    </div>
  {/snippet}

  <p>Wanna play with testnet eth? Solve a practice Wordle game to earn some.</p>

  <div class="flex-grow"></div>

  <button
    class="justify-self-end rounded bg-black p-2 font-semibold text-white"
    onclick={() => {
      goto("/game/wordle/practice")
      toggleDripGameModal()
    }}
  >
    Go To Practice Game
  </button>
</Modal>
