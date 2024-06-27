<script lang="ts">
  import { goto } from "$app/navigation"
  import { user } from "$lib/userStore.svelte"
  import { shortenAddress } from "$lib/util"
  import { openWithTab } from "../GameController.svelte"

  $effect(() => {
    if (!user.address) goto("/")
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
  <div
    class="flex h-full min-h-[600px] w-full flex-col items-center justify-evenly"
  >
    <h1 class="font-angkor text-angkor p-10 font-bold">
      Welcome {shortenAddress(user.address)}
    </h1>

    <div class="flex w-[250px] flex-col items-stretch gap-2">
      <button class="rounded-md bg-black px-4 py-2 font-bold text-white">
        Start a New Game
      </button>

      <button
        onclick={(e) => {
          e.stopImmediatePropagation()
          openWithTab("lobby")
        }}
        class="rounded-md border-2 border-black px-4 py-2 font-bold"
      >
        Join a Public Game
      </button>

      <a
        href="/game/wordle/practice"
        class="rounded-md border-2 border-black px-4 py-2 text-center font-bold"
      >
        Play a Practice Game
      </a>
    </div>

    <!-- <div class="px-4 font-bold">
      Start a Live Game

      <div class="flex flex-wrap items-center justify-center gap-4 p-4">
        {@render card("Wordle", false)}

        {#each ["Connections", "Soduko", "Crossword"] as gameName}
          {@render card(gameName, true)}
        {/each}
      </div>
    </div> -->
  </div>
{/if}
