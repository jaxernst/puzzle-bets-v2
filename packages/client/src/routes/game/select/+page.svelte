<script lang="ts">
  import { goto } from "$app/navigation"
  import { showControls } from "../../GameController.svelte"

  $effect(showControls)
</script>

{#snippet card(title: string, disabled: boolean = false)}
  <button
    {disabled}
    class="w-[343px] bg-white p-2 disabled:text-neutral-500"
    onclick={() => goto(`/game/${title.toLowerCase()}/practice`)}
  >
    <div class="font-bold">
      {title}
    </div>
  </button>
{/snippet}

<div class="flex h-full flex-col items-center justify-center gap-6">
  <div class="font-angkor text-2xl">Choose your Game.</div>

  <div class="flex w-full flex-wrap items-center justify-center gap-4">
    {@render card("Wordle", false)}

    {#each ["Connections", "Soduko", "Crossword"] as gameName}
      {@render card(gameName, true)}
    {/each}
  </div>
</div>
