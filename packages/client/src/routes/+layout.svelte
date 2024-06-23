<script>
  import "../app.css"
  import { mud } from "$lib/mudStore.svelte"
  import { walletStore } from "$lib/walletStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { shortenAddress } from "$lib/util"
  import { page } from "$app/stores"
  import GameSelector from "./GameSelector.svelte"
  import AppHeader from "./AppHeader.svelte";
  import Confetti from "$lib/components/Confetti.svelte"

  let { children } = $props()

  $effect(() => {
    if (walletStore.walletClient?.account) {
      mud.setup(walletStore.walletClient)
    }
  })

  $effect(() => void user.onWalletChange(walletStore))
</script>

<Confetti />


<div
  class="overflow-none fixed flex h-screen w-screen flex-col justify-between bg-yellow-400"
>
  {#if $page.url.pathname !== "/"}
  <AppHeader />
  {/if}

  <div class="flex-grow overflow-y-auto">
    {@render children()}
  </div>

  {#if user.address}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <GameSelector />
  {/if}
</div>
