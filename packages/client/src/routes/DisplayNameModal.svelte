<script context="module" lang="ts">
  let showDisplayNameModal = $state(false)

  export const toggleDisplayNameModal = () => {
    showDisplayNameModal = !showDisplayNameModal
  }
</script>

<script lang="ts">
  import Modal from "$lib/components/Modal.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import { user } from "$lib/userStore.svelte"

  let displayNameTemp = $state("")
  let error = $state<string | null>(null)

  async function handleSave() {
    error = null

    try {
      await user.updateDisplayName(displayNameTemp)
      displayNameTemp = ""
      toggleDisplayNameModal()
    } catch (_error: any) {
      error = _error.message ?? "Failed to set display name"
    }
  }

  let inputElement: HTMLInputElement | undefined = $state()
  $effect(() => {
    if (inputElement) {
      inputElement.focus()
    }
  })

  async function handleSubmit(event: Event) {
    event.preventDefault()
    await handleSave()
  }
</script>

<Modal bind:show={showDisplayNameModal}>
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Wallet />
      Display Name
    </div>
  {/snippet}

  {#if !user.displayName}
    <h1 class="text-base font-extrabold">Set your Display Name</h1>
  {:else}
    <h1 class="text-base font-extrabold">
      Current Display Name: {user.displayName}
    </h1>
  {/if}

  <div class="text-base leading-snug">
    Setting a display name is optional, but highly encouraged. It allows your
    friends and opponents to easily identify you by a human-readable name
    instead of a wallet address.
  </div>

  <form onsubmit={handleSubmit} class="flex flex-col gap-2">
    <div class="flex items-center gap-2 px-2">
      <input
        type="text"
        class="w-full rounded-md border-2 border-black bg-transparent px-4 py-2"
        placeholder="Your Name Here"
        bind:value={displayNameTemp}
        bind:this={inputElement}
      />

      <button type="submit" class="rounded-md bg-black px-4 py-2 text-white">
        Save
      </button>
    </div>

    {#if error}
      <p class="px-2 text-sm text-red-600">
        {error}
      </p>
    {/if}
  </form>
</Modal>
