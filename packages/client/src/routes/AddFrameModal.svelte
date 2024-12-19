<script>
  import Modal from "$lib/components/Modal.svelte"
  import { frameStore } from "$lib/farcaster/frameStore.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import { user } from "$lib/userStore.svelte"

  let show = $state(false)

  let shown = false
  $effect(() => {
    if (
      frameStore.initialized &&
      user.address &&
      user.authenticated === user.address &&
      !shown
    ) {
      shown = true
      show = true
    }
  })
</script>

<Modal bind:show class="sm:w-[375px]">
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Stars />
      <span class="font-bold">Add Farcaster Frame</span>
    </div>
  {/snippet}

  <p class="text-base font-bold">Get the most out of Puzzle Bets!</p>

  <p class="text-sm leading-tight">
    Add Puzzle Bets as a frame to receive notifications when your opponents join
    your game.
  </p>

  <hr />

  <div class="flex flex-col gap-2">
    <button
      class="justify-self-end rounded border-2 border-black bg-black p-2 font-semibold text-white"
      onclick={() => {
        frameStore.actions?.addFrame().finally(() => {
          show = false
        })
      }}
    >
      Add Frame
    </button>

    <button
      class="justify-self-end rounded border-2 border-black p-2 font-semibold text-black"
      onclick={() => (show = false)}
    >
      Dismiss
    </button>
  </div>
</Modal>
