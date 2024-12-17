<script>
  import "../app.css"
  import { walletStore } from "$lib/walletStore.svelte"
  import { page } from "$app/stores"
  import { slide } from "svelte/transition"
  import { SvelteToast, toast } from "@zerodevx/svelte-toast"
  import GameController from "./game-controller/GameController.svelte"
  import AppHeader from "./AppHeader.svelte"
  import Confetti from "$lib/components/Confetti.svelte"
  import WalletConnector from "$lib/components/WalletConnector.svelte"
  import NewGameModal from "./NewGameModal.svelte"
  import AboutModal, { toggleAboutModal } from "./AboutModal.svelte"
  import DripGameModal from "./DripGameModal.svelte"
  import { toggleDripGameModal } from "./DripGameModal.svelte"
  import DisplayNameModal from "./DisplayNameModal.svelte"
  import { user } from "$lib/userStore.svelte"
  import { formatEther, parseEther } from "viem"

  /**
   * TODO:
   * - Add notifications
   * - Fix confetti
   * - Add png characters to bgs
   * - Add link previews + other seo improvements
   */

  let { children } = $props()

  $effect(() => {
    console.log("pre-auth address:", $page.data.user)
    user.authenticated = $page.data.user
    ;(async () => {
      const framesSdk = (await import("@farcaster/frame-sdk")).sdk

      framesSdk.actions.ready()
    })()
  })

  let walletWasSet = false
  $effect(async () => {
    if (walletStore.walletClient) {
      walletWasSet = true
    }

    // There is an issue where the mud network sync won't stop properly,
    // so we reload the page after as a workaround.
    if (walletWasSet && !walletStore.walletClient) {
      window.location.reload()
    }
  })

  let isHomePage = $derived($page.url.pathname === "/")
  let isGamePath = $derived($page.url.pathname.startsWith("/game"))
</script>

<Confetti />
<WalletConnector autoconnect />

<DripGameModal />

<NewGameModal />
<AboutModal />
<DisplayNameModal />

<div class="text-base leading-snug">
  <SvelteToast />
</div>

<div
  class="overflow-none bg-pb-yellow fixed flex h-svh w-screen flex-col justify-between"
>
  {#if !isGamePath}
    <div transition:slide>
      <AppHeader />
    </div>
  {/if}

  <div class="flex-grow overflow-y-auto overflow-x-hidden">
    {@render children()}
  </div>

  {#if !isHomePage}
    <GameController />
  {/if}
</div>
