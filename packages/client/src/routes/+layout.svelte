<script>
  import "../app.css"
  import { mud } from "$lib/mudStore.svelte"
  import { walletStore } from "$lib/walletStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { page } from "$app/stores"
  import { SvelteToast, toast } from "@zerodevx/svelte-toast"
  import GameController from "./game-controller/GameController.svelte"
  import AppHeader from "./AppHeader.svelte"
  import Confetti from "$lib/components/Confetti.svelte"
  import WalletConnector from "$lib/components/WalletConnector.svelte"
  import NewGameModal from "./NewGameModal.svelte"
  import AboutModal from "./AboutModal.svelte"
  import { txErrorStore } from "$lib/mud/createSystemCalls"

  let { children } = $props()

  $effect(() => {
    if (walletStore.walletClient?.account) {
      mud.setup(walletStore.walletClient)
    }
  })

  $effect(() => void user.onWalletChange(walletStore))

  txErrorStore.subscribe((error) => {
    if (error) {
      toast.push(error, {
        duration: 6000,
        theme: {
          "--toastColor": "#ffffff",
          "--toastBackground": "#dc2626",
          "--toastBarBackground": "#fc4646",
          "--toastBorderRadius": "8px",
        },
      })
    }
  })

  let isHomePage = $derived($page.url.pathname === "/")
</script>

<Confetti />
<WalletConnector autoconnect />
<NewGameModal />
<AboutModal />

<div class="text-base leading-snug">
  <SvelteToast />
</div>

<div
  class="overflow-none bg-pb-yellow fixed flex h-screen w-screen flex-col justify-between"
>
  {#if !isHomePage}
    <AppHeader />
  {/if}

  <div class="flex-grow overflow-y-auto">
    {@render children()}
  </div>

  {#if !isHomePage}
    <GameController />
  {/if}
</div>
