<script context="module" lang="ts">
  type Tab = "lobby" | "active" | "history" | "top"
  let tab = $state<Tab>("active")
  let open = $state(false)
  let hidden = $state(false)

  export function openControls(_tab?: Tab) {
    if (_tab) tab = _tab
    open = true
    hidden = false
  }

  export function hideControls() {
    open = false
    hidden = true
  }

  export function showControls() {
    hidden = false
  }
</script>

<script lang="ts">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { spring } from "svelte/motion"
  import PuzzlePiece from "$lib/icons/PuzzlePiece.svelte"
  import { clickOutside } from "$lib/actions/clickOutside"
  import { capitalized, entityToInt, shortenAddress } from "$lib/util"
  import type { Component } from "svelte"

  import Smiley from "$lib/icons/Smiley.svelte"
  import Clock from "$lib/icons/Clock.svelte"
  import Book from "$lib/icons/Book.svelte"
  import Crown from "$lib/icons/Crown.svelte"
  import { page } from "$app/stores"
  import { user } from "$lib/userStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { getPlayerGames } from "$lib/gameQueries"
  import { toggleNewGameModal } from "./NewGameModal.svelte"
  import { goto } from "$app/navigation"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import { type Entity } from "@latticexyz/recs"
  import { type Game, GameStatus } from "$lib/types"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import { flip } from "svelte/animate"
  import GamePreviewCard from "./GamePreviewCard.svelte"

  const descriptions: Record<Tab, string> = {
    active: "Your active onchain games.",
    lobby: "Public games anyone can join.",
    history: "Your previous games and results.",
    top: "The top players and their records.",
  }

  const logos: Record<Tab, Component> = {
    active: Clock,
    lobby: Smiley,
    history: Book,
    top: Crown,
  }

  const routeLabel = $derived.by(() => {
    const path = $page.url.pathname
    if (path === "/me") return "Dashboard | Home"
    if (path.includes("/game/select")) return "Dashboard | Select"
    if (path === "/game/wordle/practice") return "Wordle | Practice"
    return ""
  })

  const SIZE_CLOSED = 55
  const SIZE_OPEN = 600

  const size = spring(SIZE_CLOSED, {
    damping: 0.49,
    stiffness: 0.075,
    precision: 0.001,
  })

  $effect(() => {
    if (open) {
      $size = SIZE_OPEN
    } else {
      $size = SIZE_CLOSED
    }
  })

  let playerGames = $derived(getPlayerGames(user.address, mud))
  let numGames = $derived(playerGames.length)
</script>

{#snippet TabButton(name: Tab)}
  <button
    onclick={() => (tab = name)}
    class={`flex w-full flex-col items-center justify-center gap-1 p-4 font-extrabold leading-none sm:flex-row ${tab === name ? "bg-black text-white" : "text-black"}`}
  >
    <svelte:component this={logos[name]} class={tab === name && "invert"} />
    {capitalized(name)}
  </button>
{/snippet}

<div style={`height: ${SIZE_CLOSED}px`}></div>

<div
  class={`absolute bottom-0 w-full ${hidden ? "translate-y-20" : ""} px-2 transition-transform sm:px-4`}
>
  <div
    onclick={() => openControls()}
    onkeydown={(event) => {
      if (event.key === "Enter") open = !open
    }}
    use:clickOutside={{
      enabled: open,
      cb: () => {
        open = false
      },
    }}
    tabindex="0"
    class=" bg-pb-beige-2 flex flex-col gap-6 rounded-t-xl border-x-2 border-t-2 border-black p-4"
    role="button"
    style={`height: ${$size}px;`}
  >
    <div class="flex items-center gap-2 font-extrabold">
      <PuzzlePiece class="h-6 w-6" />

      {routeLabel}

      <div
        class="bg-pb-beige-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs"
      >
        {numGames} Live Games
      </div>

      <div class="flex flex-grow justify-end">
        <AnimatedArrow
          class="h-6 w-6 font-bold"
          direction={open ? "down" : "up"}
        />
      </div>
    </div>

    <div class="flex flex-col items-center justify-center gap-2">
      <div
        class="flex w-full items-center justify-evenly rounded-md border-2 border-black sm:w-3/4"
      >
        {@render TabButton("lobby")}
        <div class="h-full border border-black"></div>
        {@render TabButton("active")}
        <div class="h-full border border-black"></div>
        {@render TabButton("history")}
        <div class="h-full border border-black"></div>
        {@render TabButton("top")}
      </div>

      <div class="text-xs">{descriptions[tab]}</div>
    </div>

    <div class="flex gap-2 self-center">
      <button
        class="bg-pb-yellow w-[167px] rounded-md p-3 text-center text-base font-bold"
        style={"box-shadow: 0px 6px 0px 0px #DDAC00;"}
        onclick={() => {
          if (!user.address) {
            promptConnectWallet()
          } else {
            toggleNewGameModal()
          }
        }}
      >
        {#if !user.address}
          Connect to Play Live
        {:else}
          Create Game
        {/if}
      </button>
      <button
        class="bg-pb-off-white w-[167px] rounded-md p-3 text-center text-base font-bold"
        style={"box-shadow: 0px 6px 0px 0px #E3DDCD;"}
        onclick={() => goto("/game/wordle/practice")}
      >
        Practice Game
      </button>
    </div>

    <div class="flex flex-wrap justify-center gap-3">
      {#each playerGames as game (game.id)}
        <div animate:flip>
          <GamePreviewCard {game} />
        </div>
      {/each}
    </div>
  </div>
</div>

{#snippet publicGameCard(game: Game)}
  <div
    class="flex w-[343px] flex-col gap-[10px] rounded bg-white p-4 text-[13px] leading-none"
    style={"box-shadow: 0px 5px 0px 0px #E3DDCD;"}
  >
    <div class="flex justify-between">
      <div>
        #{entityToInt(game.id)}
        <div class="font-bold">Wordle</div>
      </div>

      <div
        class="bg-pb-yellow rounded-full px-[7px] py-[5px] text-[10px] font-bold leading-none"
      >
        Open
      </div>
    </div>

    <div class="flex flex-col">
      <div class="self-end text-xs text-[#757575]">Amount to Bet</div>

      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <img
            alt="Player Avatar"
            src={"/character1.png"}
            class="h-[20px] w-[20px]"
          />
          <div>0x123...456</div>
        </div>

        <div class=" flex gap-1 font-bold">
          <div>$5.00</div>
          <div class="text-[#8F8F8F]">(.00128 ETH)</div>
        </div>
      </div>
    </div>

    <button
      class="self-stretch rounded bg-black p-3 text-center text-base text-white"
    >
      Join
    </button>
  </div>
{/snippet}
