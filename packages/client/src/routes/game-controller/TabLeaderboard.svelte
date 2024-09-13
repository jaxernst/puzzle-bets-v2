<script lang="ts">
  import { mud } from "$lib/mudStore.svelte"
  import { getLeaderboard } from "$lib/statsQueries"
  import { formatAsDollar, shortenAddress } from "$lib/util"
  import { prices } from "$lib/prices.svelte"
  import { formatEther } from "viem"

  let leaderboard = $derived(getLeaderboard(mud))
</script>

<div class="bg-pb-beige-2 rounded-lg p-4 shadow-md">
  <h2 class="mb-4 text-2xl font-bold">Leaderboard</h2>
  <table class="w-full">
    <thead>
      <tr class="text-left">
        <th class="pb-2">Rank</th>
        <th class="pb-2">Player</th>
        <th class="pb-2">Won</th>
        <th class="pb-2">Lost</th>
        <th class="pb-2">Tied</th>
        <th class="pb-2">Total Won</th>
      </tr>
    </thead>
    <tbody>
      {#each leaderboard as { rank, player, won, lost, tied, totalWonAmount }}
        <tr class="border-t border-gray-200">
          <td class="py-2">#{rank}</td>
          <td class="py-2">
            <div class="flex items-center">
              <img
                src="/avatar1.png"
                alt="Avatar"
                class="mr-2 h-6 w-6 rounded-full"
              />
              {shortenAddress(player)}
            </div>
          </td>
          <td class="py-2">{won}</td>
          <td class="py-2">{lost}</td>
          <td class="py-2">{tied}</td>
          <td class="py-2"
            >{formatAsDollar(
              Number(formatEther(totalWonAmount)) * prices.eth,
            )}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
