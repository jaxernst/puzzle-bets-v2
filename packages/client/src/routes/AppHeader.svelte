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
  class=" border-b-1 mx-2 flex items-center justify-between border-black/20 py-2 font-bold sm:mx-4"
>
  {#if $page.route.id !== "/"}
    <a href="/" class="">
      <PuzzleBetsSmall />
    </a>

    <div>
      {#if user.address}
        <div class="flex gap-2 text-sm">
          <div class="flex items-center gap-1 px-1 text-sm">
            <Avatar1 />
            {shortenAddress(user.address)}
          </div>

          <div
            class="bg-pb-beige-1 flex items-center gap-1 rounded-full border-b-2 border-r-2 border-black px-2 py-1"
          >
            <Wallet />
            {user.balance}
          </div>

          <div
            class="bg-pb-beige-1 hidden items-center gap-1 rounded-full border-b-2 border-r-2 border-black px-2 py-1 sm:flex"
          >
            0 Live Games
          </div>
        </div>
      {:else}
        <button
          class="bg-pb-beige-1 flex items-center gap-1 rounded-full border-b-2 border-r-2 border-black px-2 py-1"
          onclick={promptConnectWallet}
        >
          Connect
        </button>
      {/if}
    </div>
  {/if}
</div>
