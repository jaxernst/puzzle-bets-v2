<script lang="ts">
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
  import AddFrameModal from "./AddFrameModal.svelte"
  import { user } from "$lib/userStore.svelte"
  import { formatEther, parseEther } from "viem"
  import {
    displayNameStore,
    updateDisplayName,
  } from "$lib/displayNameStore.svelte"
  import { frameStore } from "$lib/farcaster/frameStore.svelte"
  import type { FrameContext } from "@farcaster/frame-sdk"
  import type { EvmAddress } from "$lib"

  /**
   * TODO:
   * - Add notifications (web push + farcaster frames)
   * - Fix confetti
   * - Add png characters to bgs
   * - Add link previews + other seo improvements
   */

  let { children } = $props()

  console.log("pre-auth address:", $page.data.user)
  if (!user.authenticated && $page.data.user) {
    user.authenticated = $page.data.user
  }

  // App can be run as a farcaster frame app, so we need to initialize the frame sdk if launched as a frame
  $effect(() => {
    if (!frameStore.initialized) {
      frameStore.init()
    }
  })

  // When launched as a frame app, we can auto-set the user's display name to match their farcaster name
  const maybeSetFarcasterName = async (
    forUser: EvmAddress,
    ctx: FrameContext,
  ) => {
    const fcName = ctx.user.displayName || ctx.user.username
    const pbName = await displayNameStore.fetch(forUser)

    if (!pbName && fcName) {
      updateDisplayName(forUser, fcName)
    }
  }

  $effect(() => {
    if (frameStore.initialized && user.authenticated) {
      maybeSetFarcasterName(user.authenticated, frameStore.context!)
    }
  })

  // There is an issue where the mud network sync won't stop properly,
  // so we reload the page when we identify a disconnect.
  let walletWasSet = false
  $effect(() => {
    if (walletStore.walletClient) {
      walletWasSet = true
    }

    if (walletWasSet && !walletStore.walletClient) {
      setTimeout(() => {
        window.location.reload()
      }, 500)
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
<AddFrameModal />

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
