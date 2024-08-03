<script lang="ts">
  import { mud } from "$lib/mudStore.svelte"
  import { page } from "$app/stores"
  import Modal from "$lib/components/Modal.svelte"
  import { systemTimestamp, intToEntity, capitalized } from "$lib/util"
  import { user } from "$lib/userStore.svelte"
  import { GameStatus } from "$lib/types"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import { gameIdToGame } from "$lib/gameQueries"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"

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

  let game = $derived(
    mud.synced && mud.components && gameId
      ? gameIdToGame(gameId, mud.components!)
      : null,
  )
  let userIsEligible = $derived(user.address && user.address !== game?.p1)

  let puzzleType = "wordle"

  let inviteExpired = false
  const checkInviteExpired = (inviteExpirationTime: bigint) => {
    const tDiff = Number(inviteExpirationTime) - systemTimestamp()
    if (tDiff <= 0) inviteExpired = true
  }

  let intervalTimer: NodeJS.Timer
  $effect(() => {
    if (game?.status === GameStatus.Pending && !intervalTimer) {
      checkInviteExpired(game.inviteExpiration)
      intervalTimer = setInterval(
        () => checkInviteExpired(game!.inviteExpiration),
        1000,
      )
    }

    return () => {
      if (intervalTimer) clearInterval(intervalTimer)
    }
  })
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

    <div class="text-base">
      After signing in, you can view your invite, put down your wager, and play
      your opponent in a competitive {capitalized(puzzleType)} game.
    </div>

    <hr />

    <button
      onclick={promptConnectWallet}
      class="rounded bg-black p-2 font-bold text-white">Continue</button
    >
  </Modal>
{:else}
  <Modal bind:show={showJoin}>
    {#snippet header()}
      <div class="flex gap-2">
        <Stars />
        Join Game
      </div>
    {/snippet}

    {#if !mud.synced}
      <div class="self-center">
        <DotLoader class="fill-neutral-200" />
      </div>
      <div class="self-center text-xs text-neutral-400">
        Syncing blockchain state...
      </div>
    {:else if !gameId || !game}
      Game not found
    {:else if !userIsEligible}
      You are not elligible for this game
    {:else if inviteExpired || game?.status === GameStatus.Inactive}
      Game invite expired
    {:else if game?.status === GameStatus.Active || game?.status === GameStatus.Complete}
      Game already started!
    {:else}
      Join Game options
    {/if}
  </Modal>
{/if}

<slot />
