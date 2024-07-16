<script lang="ts">
  import { formatAsDollar, formatSigFig, shortenAddress } from "$lib/util"
  import { page } from "$app/stores"
  import { user } from "$lib/userStore.svelte"
  import PuzzleBetsSmall from "$lib/assets/PuzzleBetsSmall.svelte"
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import { prices } from "$lib/prices.svelte"
</script>

<div
  class=" border-b-1 mx-2 flex items-center justify-between border-black/20 py-2 font-bold sm:mx-4"
>
  {#if $page.route.id !== "/"}
    <a href="/" class="">
      <PuzzleBetsSmall />
    </a>

    <div class="">
      {#if user.address}
        <div class="flex gap-2">
          <div class="flex items-center gap-1 px-1 text-sm">
            <Avatar1 />
            {shortenAddress(user.address)}
          </div>

          <div
            class=" bg-pb-beige-1 flex items-center gap-1 rounded-full p-2 text-xs"
          >
            <Wallet />
            {formatAsDollar(Number(user.balance) * prices.eth)}
          </div>
        </div>
      {:else}
        <button
          class="bg-pb-beige-1 flex items-center gap-1 rounded-full p-2 text-sm"
          onclick={promptConnectWallet}
        >
          Connect
        </button>
      {/if}
    </div>
  {/if}
</div>
