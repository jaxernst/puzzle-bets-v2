<script>
  import { page } from "$app/stores"
  import { gameIdToGame, isGamePlayer, playerFields } from "$lib/gameQueries"
  import { frameStore } from "$lib/farcaster/frameStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { goto } from "$app/navigation"
  import { user } from "$lib/userStore.svelte"
  import { intToEntity } from "$lib/util"
  import LiveGame from "$lib/game-components/LiveGame.svelte"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { walletStore } from "$lib/walletStore.svelte"

  let gameEntity = intToEntity($page.params.gameId)

  let game = $derived.by(() => {
    if (
      !mud.components ||
      !gameEntity ||
      !user.address ||
      !isGamePlayer(user.address, gameEntity, mud)
    ) {
      return
    }

    let game = gameIdToGame(gameEntity, mud.components)

    return {
      ...game,
      ...playerFields(game, user.address),
    }
  })

  $effect(() => {
    const frameStoreChecked = frameStore.unavailable || frameStore.initialized
    const noUser = frameStoreChecked && !walletStore.connecting && !user.address
    if (noUser || (mud.synced && !game)) {
      goto("/dashboard")
    }
  })

  $effect(() => {
    setTimeout(() => {
      if (!mud.synced) {
        goto("/dashboard")
      }
    }, 6000)
  })
</script>

{#if !mud.synced}
  <div class="flex h-screen flex-col items-center justify-center">
    <DotLoader class="h-10 w-10" />
  </div>
{/if}

{#if game && user.address && user.address === user.authenticated}
  <LiveGame {game} user={user.address} />
{/if}
