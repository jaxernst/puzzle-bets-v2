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
  import { user } from "$lib/userStore.svelte"
  import { formatEther, parseEther } from "viem"
  import {
    displayNameStore,
    updateDisplayName,
  } from "$lib/displayNameStore.svelte"
  import type { EvmAddress } from "$lib"

  /**
   * TODO:
   * - Add notifications (web push + farcaster frames)
   * - Fix confetti
   * - Add png characters to bgs
   * - Add link previews + other seo improvements
   */

  let { children } = $props()

  // If launched in a frame context, extract FC user info and call ready on the frames sdk
  const maybeInitAsFarcasterFrame = async (
    authedUserAddr: EvmAddress | undefined,
  ) => {
    console.log("Maybe init sdk")

    const framesSdk = (await import("@farcaster/frame-sdk")).sdk
    console.log(framesSdk)
    const ctx = await framesSdk.context
    console.log("Frame context:", ctx)

    if (!ctx) return

    if (authedUserAddr) {
      const fcName = ctx.user.displayName || ctx.user.username
      const pbName = await displayNameStore.fetch(authedUserAddr)

      if (!pbName && fcName) {
        updateDisplayName(authedUserAddr, fcName)
      }
    }

    console.log("Frame launched!")

    framesSdk.actions.ready()
  }

  $effect(() => {
    console.log("pre-auth address:", $page.data.user)
    user.authenticated = $page.data.user

    maybeInitAsFarcasterFrame($page.data.user)
  })

  let walletWasSet = false
  $effect(() => {
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
<WalletConnector autoconnect={$page.data.user} />

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
