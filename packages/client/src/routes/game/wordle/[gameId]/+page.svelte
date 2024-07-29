<script>
  import { page } from "$app/stores"
  import { gameIdToGame, isGamePlayer } from "$lib/gameQueries"
  import { mud } from "$lib/mudStore.svelte"
  import { goto } from "$app/navigation"
  import { user } from "$lib/userStore.svelte"
  import { intToEntity } from "$lib/util"
  import LiveGame from "./LiveGame.svelte"

  let gameEntity = intToEntity($page.params.gameId)

  const isPlayer = () =>
    user.address && gameEntity && isGamePlayer(user.address, gameEntity, mud)

  $effect(() => {
    if (!isPlayer()) {
      goto("/dashboard")
    }
  })

  let game = $derived.by(() => {
    if (
      !mud.components ||
      !gameEntity ||
      !user.address ||
      !isGamePlayer(user.address, gameEntity, mud)
    ) {
      return
    }

    return gameIdToGame(gameEntity, mud.components)
  })
</script>

{#if game && user.address}
  <LiveGame {game} user={user.address} />
{/if}
