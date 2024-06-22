<script lang="ts">
  import { shortenAddress } from "$lib/util";
  import { page } from "$app/stores";
  import { user } from "$lib/userStore.svelte";
  import PuzzleBetsSmall from "$lib/assets/PuzzleBetsSmall.svelte";
  import Avatar1 from "$lib/assets/Avatar1.svelte";
  import { walletStore } from "$lib/walletStore.svelte";
</script>

<div class="flex justify-between p-4 font-bold">
  {#if $page.route.id !== "/"}
    <PuzzleBetsSmall />

    <div>
      {#if user.address}
        <div class="flex gap-2">
          <div class="flex gap-1 items-center">
            <Avatar1 />
            {shortenAddress(user.address)}
          </div>

          <div class="rounded-full bg-yellow-200 px-2 py-1.5">Balance</div>
        </div>
      {:else}
        <button
          class="rounded-full bg-yellow-200 px-2 py-1.5"
          onclick={() => walletStore.connect()}
        >
          Connect
        </button>
      {/if}
    </div>
  {/if}
</div>
