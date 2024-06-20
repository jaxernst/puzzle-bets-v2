<script lang="ts">
  import { setupNetwork, type Components } from "$lib/mud/setupNetwork";
  import { type Wallet } from "$lib/mud/setupNetwork";
  import { type EvmAddress } from "$lib";
  import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common";
  import { createWalletClient } from "viem";
  import { networkConfig } from "$lib/mud/networkConfig";
  import { mud } from "$lib/mudStore.svelte";

  let wallet = $state<{
    address: EvmAddress | null;
    connected: boolean;
    client: Wallet | null;
  }>({
    address: null,
    connected: false,
    client: null,
  });

  $effect(() => {
    if (wallet.client?.account) {
      mud.setup(wallet.client);
    }
  });

  function connectBurner() {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey());

    const walletClient = createWalletClient({
      ...networkConfig,
      account: burnerAccount,
    }) as Wallet;

    wallet.client = walletClient;
    wallet.address = walletClient.account.address;
    wallet.connected = true;
  }
</script>

<h1>Puzzle Bets Controller</h1>

{#if !wallet.connected}
  <button onclick={connectBurner}>Connect wallet</button>
{:else}
  <h2>
    Welcome {wallet.address}
  </h2>
{/if}

Mud status: {mud.synced ? "Synced" : wallet.address ? "Syncing" : "Inactive"}

{#if mud.synced}
  <div class="p-2">
    <h1>Actions</h1>
    {#each Object.entries(mud.systemCalls!) as [key, val]}
      <div>{key}()</div>
    {/each}
  </div>
{/if}
