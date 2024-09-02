<script lang="ts">
  import { mud } from "$lib/mudStore.svelte"
  import { page } from "$app/stores"
  import Modal from "$lib/components/Modal.svelte"
  import { intToEntity, capitalized, timeRemaining } from "$lib/util"
  import { user } from "$lib/userStore.svelte"
  import { GameStatus } from "$lib/types"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import { gameIdToGame } from "$lib/gameQueries"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import JoinGame from "./JoinGame.svelte"
  import { getComponentValue } from "@latticexyz/recs"
  import { goto } from "$app/navigation"

  let { children } = $props()
  let showJoin = $state(false)
  let showNoUser = $state(false)

  $effect(() => {
    if (user.address) {
      showJoin = true
      showNoUser = false
    } else {
      showJoin = false
      showNoUser = true
    }
  })

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

  let puzzleType = "wordle"

  let inviteTimeRemaining = $derived(
    game && game.status === GameStatus.Pending
      ? timeRemaining(Number(game.inviteExpiration))
      : -1,
  )
</script>

{#if !user.address}
  <Modal
    bind:show={showNoUser}
    class="sm:w-[375px]"
    onClose={() => (showNoUser = true)}
  >
    {#snippet header()}
      <div class="flex items-center gap-2">
        <Stars />
        You've been invited!
      </div>
    {/snippet}

    <div class="font-bold">Sign in to Puzzle Bets to accept the invite</div>

    <div class="text-sm leading-tight">
      After signing in, you can view your invite, put down your wager, and play
      your opponent in a competitive {capitalized(puzzleType)} game.
    </div>

    <hr />

    <button
      onclick={promptConnectWallet}
      class="rounded bg-black p-2 font-bold text-white">Continue</button
    >
  </Modal>
{/if}

<Modal
  bind:show={showJoin}
  onClose={() => goto("/dashboard")}
  class="sm:w-[375px]"
>
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
    <div class="self-center text-sm font-bold">Syncing blockchain state...</div>
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

{#snippet returnHomeMessage(msg: string)}
  <div class="self-center font-bold">{msg}</div>
  <hr />
  {@render returnHomeButton()}
{/snippet}

{#snippet returnHomeButton()}
  <a href="/" class="rounded bg-black p-2 text-center font-bold text-white">
    Return Home
  </a>
{/snippet}

{@render children()}
