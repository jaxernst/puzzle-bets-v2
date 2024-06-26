<script lang="ts">
  import { shortenAddress } from "$lib/util"
  import { page } from "$app/stores"
  import { user } from "$lib/userStore.svelte"
  import PuzzleBetsSmall from "$lib/assets/PuzzleBetsSmall.svelte"
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
</script>

<div
  class="flex items-center justify-between border-b border-[#E5B300] px-4 py-2 font-bold"
>
  {#if $page.route.id !== "/"}
    <a href="/">
      <PuzzleBetsSmall />
    </a>

    <div>
      {#if user.address}
        <div class="flex gap-2">
          <div class="flex items-center gap-1">
            <Avatar1 />
            {shortenAddress(user.address)}
          </div>

          <div
            class="flex items-center gap-1 rounded-full bg-yellow-200 px-2 py-1.5"
          >
            <Wallet />
            {user.balance}
          </div>
        </div>
      {:else}
        <button
          class="rounded-full bg-yellow-200 px-2 py-1 text-sm"
          onclick={promptConnectWallet}
        >
          Connect
        </button>
      {/if}
    </div>
  {/if}
</div>
