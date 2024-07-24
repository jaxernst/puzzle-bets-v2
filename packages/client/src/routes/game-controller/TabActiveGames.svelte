<script lang="ts">
  import { getPlayerGames } from "$lib/gameQueries"
  import { mud } from "$lib/mudStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { flip } from "svelte/animate"
  import GamePreviewCard from "./GamePreviewCard.svelte"

  let playerGames = $derived(getPlayerGames(user.address, mud))
</script>

<div class="flex flex-wrap justify-center gap-3">
  {#each playerGames as game (game.id)}
    <div animate:flip>
      <GamePreviewCard {game} />
    </div>
  {/each}
</div>
