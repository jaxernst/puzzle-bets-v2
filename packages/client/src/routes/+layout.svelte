<script>
  import "../app.css"
  import { mud } from "$lib/mudStore.svelte"
  import { walletStore } from "$lib/walletStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { page } from "$app/stores"
  import GameController from "./game-controller/GameController.svelte"
  import AppHeader from "./AppHeader.svelte"
  import Confetti from "$lib/components/Confetti.svelte"
  import WalletConnector from "$lib/components/WalletConnector.svelte"
  import NewGameModal from "./NewGameModal.svelte"
  import AboutModal from "./AboutModal.svelte"

  let { children } = $props()

  $effect(() => {
    if (walletStore.walletClient?.account) {
      mud.setup(walletStore.walletClient)
    }
  })

  $effect(() => void user.onWalletChange(walletStore))

  let isHomePage = $derived($page.url.pathname === "/")
</script>

<Confetti />
<WalletConnector />
<NewGameModal />
<AboutModal />

<div
  class="overflow-none bg-pb-yellow fixed flex h-screen w-screen flex-col justify-between"
>
  {#if !isHomePage}
    <AppHeader />
  {/if}

  <div class="flex-grow overflow-y-auto">
    {@render children()}
  </div>

  {#if !isHomePage && user.address}
    <GameController />
  {/if}
</div>
