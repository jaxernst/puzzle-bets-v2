<script lang="ts">
  import { mud } from "$lib/mudStore.svelte";
  import { walletStore } from "$lib/walletStore.svelte"
  import { makeUserStore } from "$lib/userStore.svelte"

  let user: ReturnType<typeof makeUserStore> | undefined

  $effect(() => {
    if (walletStore.walletClient?.account) {
      mud.setup(walletStore.walletClient);
      user = makeUserStore(walletStore)
    }
  });

  $inspect(user)

</script>

<h1>Puzzle Bets Controller</h1>

{#if !walletStore.address}
  <button onclick={walletStore.connect}>Connect wallet</button>
{:else}
  <h2>
    Welcome {walletStore.address}
  </h2>
{/if}

Mud status: {mud.synced ? "Synced" : walletStore.address ? "Syncing" : "Inactive"}

{#if mud.synced}
  <div class="p-2">
    <h1>Actions</h1>
    {#each Object.entries(mud.systemCalls!) as [key, val]}
      <div>{key}()</div>
    {/each}
  </div>
{/if}
