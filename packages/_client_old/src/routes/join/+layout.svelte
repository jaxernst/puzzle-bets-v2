<script lang="ts">
  import { mud } from "$lib/mud/mudStore"
  import { page } from "$app/stores"
  import Modal from "$lib/components/Modal.svelte"
  import { systemTimestamp, intToEntity } from "$lib/util"
  import JoinGame from "./JoinGame.svelte"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { loginAndConnect } from "$lib/components/wallet/WalletConnector.svelte"
  import { user } from "$lib/userStore"
  import { getGame } from "$lib/gameStores"
  import { GameStatus } from "$lib/types"
  import DotLoader from "$lib/components/DotLoader.svelte"

  let show = true

  onMount(() => {
    if (!$user.address) {
      loginAndConnect()
    }
  })

  $: gameId = isNaN(parseInt($page.params.joinGameId))
    ? null
    : intToEntity($page.params.joinGameId, true)

  $: game = gameId && $getGame(gameId)
  $: userIsEligible = $user.address && $user.address !== game?.p1

  let inviteExpired = false
  const checkInviteExpired = (inviteExpirationTime: bigint) => {
    const tDiff = Number(inviteExpirationTime) - systemTimestamp()
    if (tDiff <= 0) inviteExpired = true
  }

  let intervalTimer: any
  $: if (game && !intervalTimer) {
    checkInviteExpired(game.inviteExpiration)
    intervalTimer = setInterval(
      () => checkInviteExpired(game!.inviteExpiration),
      1000,
    )
  }
</script>

{#if $user.address}
  <Modal
    {show}
    on:close={() => {
      show = false
      goto("/welcome")
    }}
  >
    <div
      class="relative flex min-w-[200px] max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-4 text-neutral-200 sm:p-5"
    >
      {#if !$mud.ready}
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
        <JoinGame
          {gameId}
          on:joined={() =>
            goto(`/games/${game?.type}/${parseInt(gameId ?? "", 16)}`)}
        />
      {/if}

      <a class="absolute right-2 top-0 text-neutral-400" href={"/welcome"}>x</a>
    </div>
  </Modal>
{/if}

<slot />
