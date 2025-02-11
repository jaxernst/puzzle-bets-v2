<script lang="ts">
  import { mud } from "$lib/mudStore.svelte"
  import { getLeaderboard } from "$lib/statsQueries"
  import { formatAsDollar, shortenAddress, formatSigFig } from "$lib/util"
  import { prices } from "$lib/prices.svelte"
  import { formatEther } from "viem"
  import { displayNameStore } from "$lib/displayNameStore.svelte"

  let leaderboard = $derived(getLeaderboard(mud))
</script>

{#if leaderboard.length > 0}
  <div class="sm:p-4">
    <table
      class="w-full border-separate border-spacing-y-3 text-sm sm:text-base"
    >
      <thead>
        <tr>
          <th class="hidden sm:table-cell">Rank</th>
          <th class=" sm:hidden">#</th>

          <th class="text-left">Player</th>
          <th class="text-left">W / L / T</th>
          <th class="text-left">Amount Won</th>
        </tr>
      </thead>
      <tbody>
        {#each leaderboard as { rank, player, won, lost, tied, profit }}
          {@const playerName = displayNameStore.get(player, false)}
          {@const profitEth = Number(formatEther(profit))}

          <tr class=" bg-pb-off-white rounded">
            <td
              class="rounded-l p-1.5 text-center sm:p-3"
              style="box-shadow: 0px 5px 0px 0px #E3DDCD;"
            >
              {rank}
            </td>
            <td
              class="p-1.5 sm:p-3"
              style="box-shadow: 0px 5px 0px 0px #E3DDCD;"
            >
              <div class="flex items-center">
                <img
                  src="/avatar-1.png"
                  alt="Avatar"
                  class="mr-2 h-5 w-5 rounded-full sm:h-6 sm:w-6"
                />
                <div>
                  {#if playerName}
                    <div class="font-bold">{playerName}</div>
                    <div class=" text-sm">({shortenAddress(player)})</div>
                  {:else}
                    <div class="font-medium">{shortenAddress(player)}</div>
                  {/if}
                </div>
              </div>
            </td>
            <td
              class="whitespace-nowrap p-1.5 sm:p-3"
              style="box-shadow: 0px 5px 0px 0px #E3DDCD;"
              >{won} / {lost} / {tied}</td
            >
            <td
              class="rounded-r p-3 font-bold"
              style="box-shadow: 0px 5px 0px 0px #E3DDCD;"
            >
              {formatAsDollar(profitEth * prices.eth)}
              ({formatSigFig(profitEth, 2)} ETH)
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
