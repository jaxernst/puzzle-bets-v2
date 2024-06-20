<script lang="ts">
  import { mud } from "$lib/mud/mudStore"
  import { user } from "$lib/userStore"
  import WalletIcon from "$lib/icons/Wallet.svelte"
  import { walletStore } from "$lib/walletStore"
  import { loginAndConnect } from "$lib/components/wallet/WalletConnector.svelte"
  import Puzzly from "$lib/icons/Puzzly.svelte"
  import EthSymbol from "$lib/icons/EthSymbol.svelte"
  import CopyableAddress from "$lib/components/CopyableAddress.svelte"
  import NotificationBell from "$lib/icons/NotificationBell.svelte"
  import { notifications } from "$lib/notifications/notificationStore"
  import { getPWADisplayMode, isIosSafari } from "$lib/util"
  import { browser } from "$app/environment"
  import DotLoader from "$lib/components/DotLoader.svelte"

  $: maybeToggleNotifications = () => {
    if ($notifications.enabled) return $notifications.toggle()

    // Before enabling notifications, make sure device supports it. If we're on
    // ios safari, we need to be in standalone mode
    if (isIosSafari() && getPWADisplayMode() === "browser") {
      alert(
        "Please install the app to enable notifications. You can do this by clicking the 'Add to Home Screen' button in your browser.",
      )
      return
    }

    $notifications.toggle()
  }
</script>

<div class="flex w-full items-center justify-between">
  <div
    class="text-off-black flex items-center text-lg font-bold tracking-wide sm:text-xl"
  >
    <a href="/welcome">
      <Puzzly class="fill-off-black h-10 w-10 sm:h-11 sm:w-11" />
    </a>

    <div style="line-height: 1em">
      {#if $user.address}
        <div class="text-base sm:text-lg">
          <CopyableAddress address={$user.address}></CopyableAddress>
        </div>
      {:else}
        <a class="px-1" href="/welcome"> Puzzle Bets</a>
      {/if}
    </div>
  </div>
  <div class="flex items-center justify-end gap-2 sm:gap-3">
    {#if $user.address}
      <div class="flex items-center gap-1">
        <div class="text-off-black font-mono text-sm sm:text-base">
          {$user.balance}
        </div>
        <div class="fill-off-black h-4 w-4">
          <EthSymbol />
        </div>
      </div>
    {/if}
    <button
      class="flex h-7 items-center justify-center"
      on:click={() => loginAndConnect()}
    >
      {#if !$user.address}
        {#if $walletStore.connecting}
          <DotLoader class="fill-neutral-600" />
        {:else}
          <button
            class="whitespace-nowrap rounded-full bg-lime-500 px-2 py-1 text-[.8rem] font-semibold"
            on:click={loginAndConnect}
          >
            Connect to play live
          </button>
        {/if}
      {:else}
        <WalletIcon class="stroke-off-black h-6 w-6" />
        {#if $walletStore && $mud.ready && $user.authenticated}
          <div
            class="h-[.4rem] w-[.4rem] self-start rounded-full bg-green-500"
          />
        {/if}
      {/if}
    </button>
    {#if $user.address}
      <button
        class="flex h-7 items-center justify-center"
        on:click={maybeToggleNotifications}
      >
        <div
          class={`fill-off-black/90 h-5 w-5 transition-colors
              ${$notifications.enabled ? "" : "opacity-50"} 
              ${$notifications.loading ? "animate-pulse" : ""}
            `}
        >
          <NotificationBell />
        </div>
        {#if $notifications.enabled}
          <div
            class="h-[.4rem] w-[.4rem] self-start rounded-full bg-green-500"
          ></div>
        {/if}
      </button>
    {/if}
  </div>
</div>
