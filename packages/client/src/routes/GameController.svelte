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
  import { tweened, spring } from "svelte/motion"
  import PuzzlePiece from "$lib/icons/PuzzlePiece.svelte"
  import { clickOutside } from "$lib/actions/clickOutside"
  import { capitalized } from "$lib/util"
  import type { Component } from "svelte"

  import Smiley from "$lib/icons/Smiley.svelte"
  import Clock from "$lib/icons/Clock.svelte"
  import Book from "$lib/icons/Book.svelte"
  import Crown from "$lib/icons/Crown.svelte"
  import { page } from "$app/stores"

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
    class=" bg-pb-silver flex flex-col gap-6 rounded-t-xl border-x-2 border-t-2 border-black p-4"
    role="button"
    style={`height: ${$size}px;`}
  >
    <div class="flex items-center gap-2 font-extrabold">
      <PuzzlePiece class="h-6 w-6" />

      {routeLabel}

      <div
        class="bg-pb-beige-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs"
      >
        0 Live Games
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

      <div class="text-sm">{descriptions[tab]}</div>
    </div>
  </div>
</div>
