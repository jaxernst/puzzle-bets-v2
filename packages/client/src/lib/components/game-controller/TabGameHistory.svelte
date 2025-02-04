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
      .sort(({ status: statusA, id: idA }, { status: statusB, id: idB }) => {
        if ( statusA === GameStatus.Inactive && statusB !== GameStatus.Inactive) {
          return 1 // gameA is inactive, move it down
        }

        if ( statusA !== GameStatus.Inactive && statusB === GameStatus.Inactive) {
          return -1 // gameB is inactive, move it down
        }

        // Both are complete, sort by gameId descending
        return idB - idA
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
