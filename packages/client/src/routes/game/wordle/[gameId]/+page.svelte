<script>
  import { page } from "$app/stores"
  import { gameIdToGame } from "$lib/gameQueries"
  import { mud } from "$lib/mudStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { intToEntity } from "$lib/util"
  import LiveGame from "./LiveGame.svelte"

  let gameEntity = intToEntity($page.params.gameId)
  let game = $derived.by(() => {
    if (!mud.components || !gameEntity) return
    return gameIdToGame(gameEntity, mud.components)
  })
</script>

{#if game && user.address}
  <LiveGame {game} user={user.address} />
{/if}
