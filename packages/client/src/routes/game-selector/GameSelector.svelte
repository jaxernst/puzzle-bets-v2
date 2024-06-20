<script lang="ts">
  import {
    lobbyGames,
    userArchivedGames,
    userGames as userGameStore,
  } from "$lib/gameStores"
  import { type PuzzleType, GameStatus, type Game } from "$lib/types"

  import { slide } from "svelte/transition"
  import { cubicInOut, cubicOut, sineInOut } from "svelte/easing"
  import GamePreviewCard from "./GamePreviewCard.svelte"
  import Expand from "$lib/icons/Expand.svelte"
  import { flip } from "svelte/animate"
  import { page } from "$app/stores"
  import { capitalized, entityToInt, intToEntity } from "$lib/util"
  import { clickOutside } from "$lib/actions/clickOutside"
  import { spring } from "svelte/motion"
  import PublicGameCard from "./PublicGameCard.svelte"
  import ButtonSecondary from "$lib/components/ButtonSecondary.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import NewGameModal from "../games/new-game/NewGame.svelte"

  $: userGames = $userGameStore.reduce<{
    active: Game[]
    completed: Game[]
    archived: Game[]
  }>(
    (acc, game) => {
      if ($userArchivedGames.includes(game.id)) {
        return { ...acc, archived: [...acc.archived, game] }
      }

      if (
        game.status === GameStatus.Complete ||
        game.status === GameStatus.Inactive
      ) {
        return { ...acc, completed: [...acc.completed, game] }
      }

      return { ...acc, active: [...acc.active, game] }
    },
    { active: [], completed: [], archived: [] },
  )

  type Tab = "lobby" | "active" | "completed" | "archived"
  let selectedTab: Tab = "active"
  const myGameTabs = ["active", "completed", "archived"] as const

  $: gameId = $page.params.gameId && intToEntity($page.params.gameId)
  $: gameIdTab = userGames.archived.some((g) => g.id === gameId)
    ? "archived"
    : userGames.completed.some((g) => g.id === gameId)
      ? "completed"
      : userGames.active.some((g) => g.id === gameId)
        ? "active"
        : "active"

  $: selectedTab = gameIdTab as any

  $: currentTabGames = (() => {
    switch (selectedTab) {
      case "lobby":
        return $lobbyGames
      case "active":
        return userGames.active
      case "completed":
        return userGames.completed
      case "archived":
        return userGames.archived
    }
  })().sort((a, b) => {
    return Number(entityToInt(b.id)) - Number(entityToInt(a.id))
  })

  let expandedView = false

  const height = spring(0, {
    stiffness: 0.066,
    damping: 0.39,
    precision: 0.001,
  })

  $: if (expandedView) {
    $height = 260
  } else {
    $height = 65
  }

  let showNewGameModal = false
</script>

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false
  }}
>
  <NewGameModal puzzleType="wordle" />
</Modal>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="flex flex-col gap-2 rounded-t-xl bg-neutral-800 px-1 pt-2 font-semibold"
  style={`height: ${$height}px`}
  use:clickOutside={{
    enabled: expandedView,
    cb: () => (expandedView = false),
  }}
  on:click={() => (expandedView = true)}
>
  <div
    class={`flex cursor-pointer items-center gap-4 pl-2 text-[.82rem] transition-all duration-500`}
  >
    <button
      on:click={() => (selectedTab = "lobby")}
      class={`flex py-1 text-lime-500 transition-all duration-200 ${
        selectedTab === "lobby" ? "" : "opacity-50"
      }`}
    >
      Lobby
      {#if $lobbyGames.length > 0}
        <div
          class="ml-[.14rem] h-1.5 w-1.5 animate-pulse rounded-full bg-lime-500"
        />
      {/if}
    </button>

    <div class="text-neutral-500">|</div>

    {#each myGameTabs as tab}
      <button
        on:click={() => (selectedTab = tab)}
        class={`flex py-1 transition-all duration-200 ${
          selectedTab === tab ? "" : "opacity-50"
        }`}
      >
        {#if selectedTab === tab}
          <span
            transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
            class="min-w-0 pr-2 font-bold text-lime-500"
            >{userGames[tab].length}</span
          >
        {/if}
        {capitalized(tab)}
      </button>
    {/each}

    <div class="flex flex-grow items-center justify-end">
      <button
        class="flex items-center p-1 pb-1.5"
        on:click|stopPropagation={() => (expandedView = !expandedView)}
      >
        <div
          class={`h-4 w-4 stroke-neutral-400 ${
            expandedView ? "rotate-180" : ""
          } transition-transform`}
        >
          <Expand />
        </div>
      </button>
    </div>
  </div>

  {#if selectedTab === "lobby"}
    {#if $lobbyGames.length === 0}
      <div
        class="flex flex-col items-start gap-3 px-3 text-sm text-neutral-300"
      >
        No public games available...
        <ButtonSecondary
          on:click={() => (showNewGameModal = true)}
          class="text-sm">Start Your Own</ButtonSecondary
        >
      </div>
    {:else}
      <div
        class="flex items-center gap-2 px-3 text-sm font-normal text-neutral-300"
      >
        <span class="ptext-base font-semibold text-lime-500"
          >{$lobbyGames.length}</span
        >
        public {$lobbyGames.length === 1 ? "game" : "games"} available to join
      </div>
    {/if}
  {/if}

  <div class="overflow-y-auto px-3">
    <div
      class={`no-scrollbar mt-1 grid w-full grid-cols-2 gap-1 sm:grid-cols-3`}
    >
      {#each currentTabGames as game (game.id)}
        <div animate:flip={{ duration: 650, easing: cubicInOut }}>
          {#if "public" in game}
            <PublicGameCard {game} />
          {:else}
            <GamePreviewCard {game} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
