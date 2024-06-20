<script lang="ts">
  import { page } from "$app/stores"
  import { GameStatus, type PuzzleType } from "$lib/types"
  import GameHeader from "./GameHeader.svelte"
  import GameHud from "./GameHud.svelte"
  import { userGames } from "$lib/gameStores"
  import { formatTime, systemTimestamp, intToEntity } from "$lib/util"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  $: puzzleType = $page.route.id?.split("/")[2] as PuzzleType
  $: gameId = intToEntity($page.params.gameId)
  $: game = $userGames.find((g) => g.id === gameId)

  onMount(() => {
    if (gameId && !game) {
      goto("/welcome")
    }
  })

  let inviteExpiry: number | undefined
  onMount(() =>
    setInterval(() => {
      if (!game) return

      const tDiff = Number(game.inviteExpiration) - systemTimestamp()
      inviteExpiry = tDiff > 0 ? tDiff : 0
    }, 1000),
  )
</script>

<div class="flex flex-grow flex-col gap-4">
  <GameHeader {puzzleType} {gameId} />

  {#if gameId}
    <div class="w-full">
      <GameHud {gameId} />
    </div>
  {/if}

  {#key $page.route.id}
    {#if game && game.status === GameStatus.Pending}
      <div class="flex grow flex-col items-center justify-center pb-14">
        <div
          class="rounded-lg border-2 border-neutral-300 p-6 text-center text-sm font-bold text-neutral-700"
        >
          The puzzle will reveal for both players once the invite is accepted
          <div class="mt-3 text-sm font-medium italic text-neutral-500">
            {#if inviteExpiry && inviteExpiry > 0}
              Invite expires in {formatTime(inviteExpiry)}...
            {:else if inviteExpiry !== undefined}
              Invite Expired
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div class="py-2">
        <slot />
      </div>
    {/if}
  {/key}
</div>
