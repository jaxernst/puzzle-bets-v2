<script context="module" lang="ts">
  type Tab = "lobby" | "active" | "history" | "top"
  let tab = $state<Tab>("active")
  let open = $state(false)
  let hidden = $state(true)

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
  import {
    getActivePlayerGames,
    getPlayerGames,
    getPublicGames,
  } from "$lib/gameQueries"
  import { toggleNewGameModal } from "../NewGameModal.svelte"
  import { goto } from "$app/navigation"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import { type Game, GameStatus } from "$lib/types"
  import TabActiveGames from "./TabActiveGames.svelte"
  import TabLobbyGames from "./TabLobby.svelte"
  import TabGameHistory from "./TabGameHistory.svelte"
  import TabLeaderboard from "./TabLeaderboard.svelte"
  import { tweened } from "svelte/motion"
  import { cubicOut } from "svelte/easing"
  import { onMount } from "svelte"

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
    if (path === "/dashboard") return "Dashboard"
    if (path === "/game/wordle/practice") return "Wordle | Practice"
    return ""
  })

  const SIZE_CLOSED = 60
  const SIZE_OPEN = 600

  const size = spring(SIZE_CLOSED, {
    damping: 0.5,
    stiffness: 0.075,
    precision: 0.005,
  })

  $effect(() => {
    if (open) {
      $size = SIZE_OPEN
    } else {
      $size = SIZE_CLOSED
    }
  })

  let numActiveGames = $derived(getActivePlayerGames(user.address, mud).length)
  let numLobbyGames = $derived(getPublicGames(mud).length)

  const tabUnderline = tweened(
    { left: 0, width: 0 },
    {
      duration: 120,
      easing: cubicOut,
    },
  )

  let tabRefs: Record<Tab, HTMLElement | null> = {
    lobby: null,
    active: null,
    history: null,
    top: null,
  }

  const TAB_UNDERLINE_WIDTH = 26
  function updateTabUnderline(name: Tab) {
    const activeTab = tabRefs[name]
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab

      tabUnderline.set({
        left: offsetLeft + offsetWidth / 2 - TAB_UNDERLINE_WIDTH / 2,
        width: TAB_UNDERLINE_WIDTH,
      })
    }
  }

  $effect(() => {
    updateTabUnderline(tab)
  })

  onMount(() => {
    const handleResize = () => updateTabUnderline(tab)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  })
</script>

{#snippet TabButton(name: Tab, numGames?: number)}
  <button
    bind:this={tabRefs[name]}
    onclick={() => {
      tab = name
      updateTabUnderline(name)
    }}
    class={`flex items-center justify-center gap-1 text-sm leading-none tracking-tight transition-all sm:text-[15px] ${
      open && tab === name ? "scale-110 font-black" : "font-bold"
    }`}
  >
    <svelte:component
      this={logos[name]}
      class={tab === name ? "stroke-4" : ""}
    />
    <div>{capitalized(name)}</div>

    {#if typeof numGames === "number"}
      <div class="text-xs sm:text-sm">({numGames})</div>
    {/if}
  </button>
{/snippet}

<div
  class={`absolute bottom-0 flex w-full justify-center  ${hidden ? "translate-y-20" : ""} transition-transform sm:px-4`}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    tabindex="0"
    class=" bg-pb-beige-2 flex max-w-[1160px] flex-grow flex-col gap-4 rounded-t-xl border-x-2 border-t-2 border-black p-4"
    style={`height: ${$size}px;`}
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
  >
    <div class="flex items-center gap-1 font-extrabold">
      <div>
        <div class="relative flex gap-4 sm:gap-6">
          {@render TabButton("lobby", numLobbyGames)}
          {@render TabButton("active", numActiveGames)}
          {@render TabButton("history")}
          {@render TabButton("top")}
        </div>

        {#if open}
          <div
            class="mt-2 h-0.5 rounded-sm bg-black/50 transition-all duration-300 ease-out"
            style="width: {$tabUnderline.width}px; transform: translateX({$tabUnderline.left}px);"
          ></div>
        {/if}
      </div>

      <!-- <div class="">{routeLabel}</div> -->

      <!-- <div
        class="bg-pb-beige-1 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:py-1 sm:text-xs"
      >
        {numActiveGames} Active Game{numActiveGames === 1 ? "" : "s"}
      </div>

      <div
        class="bg-pb-beige-1 hidden items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:py-1 sm:text-xs md:flex"
      >
        {numLobbyGames} Public Game{numLobbyGames === 1 ? "" : "s"}
      </div> -->

      <button
        onclick={(e) => {
          if (open) {
            e.stopPropagation()
            open = false
          }
        }}
        class="flex flex-grow justify-end"
      >
        <AnimatedArrow
          class="h-6 w-6 font-bold"
          direction={open ? "down" : "up"}
        />
      </button>
    </div>

    <div class="flex gap-2 self-center pt-1">
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

    <div class="mt-2 w-full text-center text-sm font-medium">
      {descriptions[tab]}
    </div>

    <div class="overflow-y-auto">
      {#if tab === "lobby"}
        <TabLobbyGames />
      {:else if tab === "active"}
        <TabActiveGames />
      {:else if tab === "history"}
        <TabGameHistory />
      {:else if tab === "top"}
        <TabLeaderboard />
      {/if}
    </div>
  </div>
</div>
