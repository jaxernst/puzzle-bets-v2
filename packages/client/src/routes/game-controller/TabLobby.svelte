<script lang="ts">
  import {getPublicGames } from "$lib/gameQueries"
  import { mud } from "$lib/mudStore.svelte"
  import { flip } from "svelte/animate"
  import PublicGamePreviewCard from "./PublicGamePreviewCard.svelte"

  let publicGames = $derived(getPublicGames(mud))
</script>

<div class="flex flex-wrap justify-center gap-3">
  {#each publicGames as game (game.id)}
    <div animate:flip>
      <PublicGamePreviewCard {game} />
    </div>
  {/each}
</div>
