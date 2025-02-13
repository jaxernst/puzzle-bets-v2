<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import JoinGame from "$lib/components/JoinGame.svelte"

  import { mud } from "$lib/mudStore.svelte"
  import { page } from "$app/stores"
  import { intToEntity, timeRemaining } from "$lib/util"
  import { user } from "$lib/userStore.svelte"
  import { GameStatus } from "$lib/types"
  import { gameIdToGame } from "$lib/gameQueries"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import { getComponentValue } from "@latticexyz/recs"
  import { goto } from "$app/navigation"
  import { toggleNewGameModal } from "./NewGameModal.svelte"

  const { show } = $props()

  let gameId = $derived.by(() => {
    return isNaN(parseInt($page.params.joinGameId))
      ? null
      : intToEntity($page.params.joinGameId, true)
  })

  let game = $derived.by(() => {
    if (!mud.synced || !mud.components || !gameId) return

    const isGame =
      getComponentValue(mud.components.PuzzleType, gameId) !== undefined
    if (!isGame) return

    return gameIdToGame(gameId, mud.components!)
  })

  let userIsEligible = $derived(user.address && user.address !== game?.p1)

  let inviteTimeRemaining = $derived(
    game && game.status === GameStatus.Pending
      ? timeRemaining(Number(game.inviteExpiration))
      : -1,
  )
</script>

{#snippet returnHomeMessage(msg: string)}
  <div class="flex flex-col gap-2">
    <div class="self-center font-bold">{msg}</div>
    <p class="text-center text-sm leading-snug">
      You can create your own game and challenge your friends by sharing the
      invite link
    </p>
  </div>

  <hr />

  <div class="flex flex-col gap-2">
    <button
      onclick={toggleNewGameModal}
      class="rounded border-2 border-black bg-black p-2 text-center font-bold text-white"
    >
      Create New Game
    </button>

    <button
      onclick={() => goto("/dashboard")}
      class="rounded border-2 border-black p-2 text-center font-bold"
    >
      Return Home
    </button>
  </div>
{/snippet}

<Modal {show} onClose={() => goto("/dashboard")} class="sm:w-[375px]">
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Stars />
      Join Game
    </div>
  {/snippet}

  {#if !mud.synced}
    <div class="self-center">
      <DotLoader class="fill-black" />
    </div>
  {:else if !gameId || !game}
    {@render returnHomeMessage("Game not found")}
  {:else if !userIsEligible}
    {@render returnHomeMessage("You are not elligible for this game")}
  {:else if inviteTimeRemaining === 0 || game?.status === GameStatus.Inactive}
    {@render returnHomeMessage("Game invite expired")}
  {:else if game?.status === GameStatus.Active || game?.status === GameStatus.Complete}
    {@render returnHomeMessage("Game already started!")}
  {:else}
    <JoinGame {game} {inviteTimeRemaining} />
  {/if}
</Modal>
