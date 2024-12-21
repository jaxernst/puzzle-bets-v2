<script lang="ts">
  import { getPlayerGames } from "$lib/gameQueries"
  import { mud } from "$lib/mudStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { flip } from "svelte/animate"
  import GamePreviewCard from "./GamePreviewCard.svelte"
  import { GameStatus } from "$lib/types"
  import { getComponentValueStrict } from "@latticexyz/recs"

  let playerGames = $derived(
    getPlayerGames(user.address, mud)
      .filter(({ status }) => {
        return status === GameStatus.Complete || status === GameStatus.Inactive
      })
      .sort(({ status: statusA }, { status: statusB }) => {
        return (
          (statusA === GameStatus.Inactive ? 1 : 0) -
          (statusB === GameStatus.Inactive ? 1 : 0)
        )
      }),
  )
</script>

<div class="flex flex-wrap justify-center gap-3">
  {#each playerGames as game (game.id)}
    <div animate:flip>
      <GamePreviewCard {game} />
    </div>
  {/each}
</div>
