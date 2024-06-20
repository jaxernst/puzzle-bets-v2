<script lang="ts">
  import { page } from "$app/stores"
  import Dropdown from "$lib/components/Dropdown.svelte"
  import { goto } from "$app/navigation"
  import { user } from "$lib/userStore"
  import { type PuzzleType } from "$lib/types"
  import { SUPPORTED_GAME_TYPES } from "$lib/constants"
  import { clickOutside } from "$lib/actions/clickOutside"
  import Modal from "$lib/components/Modal.svelte"
  import NewGame from "./games/new-game/NewGame.svelte"
  import { slide } from "svelte/transition"

  const gameNames = ["Wordle", "Connections", "Crossword", "Sudoku"]
  $: gameRoute = gameNames.find((game) =>
    $page.url.pathname.includes("games/" + game.toLowerCase()),
  )

  $: dropdownSelection = gameRoute ?? null
  $: puzzleType = (dropdownSelection?.toLowerCase() ?? "wordle") as PuzzleType

  const homeRoutes = ["/", "/welcome", "/about"]

  let showNewGameModal = false
  let showJoinGameInput = false
  let inputGameId = ""
</script>

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false
  }}
>
  <NewGame {puzzleType} />
</Modal>

<Dropdown
  bind:selection={dropdownSelection}
  options={gameNames}
  placeholder="Select a game"
  onOptionSelect={(option) => {
    goto(`/games/${option.toLowerCase()}/demo`)
  }}
/>
{#if !homeRoutes.includes($page.url.pathname)}
  {#if !showJoinGameInput}
    <button
      class="rounded-full border border-lime-500 px-2 text-sm font-semibold text-lime-500 active:bg-neutral-300 disabled:opacity-50"
      on:click={() => (showNewGameModal = true)}
      disabled={!$user.address || !SUPPORTED_GAME_TYPES.includes(puzzleType)}
      >New
    </button>
  {:else}
    <form
      class="flex flex-col gap-2"
      on:submit|preventDefault={() => {
        showJoinGameInput = false
        if (inputGameId) {
          goto(`/join/${inputGameId}`)
        }
      }}
    >
      <input
        type="text"
        class="w-[90px] rounded-full border border-lime-500 bg-neutral-100 px-2 text-sm font-semibold text-neutral-900"
        placeholder="Game ID"
        in:slide={{ axis: "x" }}
        bind:value={inputGameId}
        use:clickOutside={{
          enabled: showJoinGameInput,
          cb: () => {
            showJoinGameInput = false
          },
        }}
      />
    </form>
  {/if}

  <button
    class="rounded-full border border-lime-500 px-2 text-sm font-semibold text-lime-500 active:bg-neutral-300 disabled:opacity-50"
    on:click|stopPropagation={() => {
      if (showJoinGameInput && inputGameId) {
        showJoinGameInput = false
        goto(`/join/${inputGameId}`)
      } else {
        showJoinGameInput = true
      }
    }}
    disabled={!$user.address || !SUPPORTED_GAME_TYPES.includes(puzzleType)}
  >
    Join
  </button>

  <button
    class="rounded-full border border-lime-500 px-2 text-sm font-semibold text-lime-500 active:bg-neutral-300 disabled:opacity-50"
    on:click={() => goto(`/games/${puzzleType}/demo`)}
    disabled={!SUPPORTED_GAME_TYPES.includes(puzzleType)}
  >
    Practice
  </button>
{/if}
