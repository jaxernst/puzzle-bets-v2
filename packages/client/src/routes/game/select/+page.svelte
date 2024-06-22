<script lang="ts">
  import { goto } from "$app/navigation"
</script>

{#snippet card(title: string, disabled: boolean = false)}
  <button
    {disabled}
    class="bg-white p-2 disabled:text-neutral-500 w-[343px]"
    onclick={() => goto(`/game/${title.toLowerCase()}/practice`)}
  >
    <div class="font-bold">
      {title}
    </div>
  </button>
{/snippet}

<div class="h-full flex flex-col gap-6 items-center justify-center">

  <h1>Choose your Game.</h1>

  <div class="w-full flex flex-wrap items-center justify-center gap-4">
    {@render card("Wordle", false)}
    
    {#each ["Connections", "Soduko", "Crossword"] as gameName}
    {@render card(gameName, true)}
    {/each}
  </div>

</div>
