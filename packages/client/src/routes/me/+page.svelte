<script lang="ts">
  import { goto } from "$app/navigation"
  import { user } from "$lib/userStore.svelte"
  import { shortenAddress } from "$lib/util"
  import { walletStore } from "$lib/walletStore.svelte"

  $effect(() => {
    if (!walletStore.address) {
      walletStore.connect()
    }
  })
</script>

{#snippet card(title: string, disabled: boolean = false)}
  <button
    {disabled}
    class="bg-white p-2 disabled:text-neutral-500"
    onclick={() => goto(`/game/${title.toLowerCase()}/practice`)}
  >
    <div class="font-bold">
      {title}
    </div>
  </button>
{/snippet}

{#if user.address}
  <div class="flex flex-col justify-evenly self-stretch">
    <h1 class="text-xl font-bold">Welcome {shortenAddress(user.address)}</h1>

    <div class="">
      New Game

      <div class="flex items-center justify-center gap-4 p-4">
        {@render card("Wordle", false)}

        {#each ["Connections", "Soduko", "Crossword"] as gameName}
          {@render card(gameName, true)}
        {/each}
      </div>
    </div>
  </div>
{/if}
