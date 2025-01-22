<script lang="ts">
  import "../app.css"

  import GameController from "$lib/components/game-controller/GameController.svelte"
  import AppHeader from "$lib/components/AppHeader.svelte"
  import Confetti from "$lib/components/Confetti.svelte"
  import WalletConnector from "$lib/components/WalletConnector.svelte"
  import NewGameModal from "$lib/components/modals/NewGameModal.svelte"
  import DripGameModal from "$lib/components/modals/DripGameModal.svelte"
  import DisplayNameModal from "$lib/components/modals/DisplayNameModal.svelte"
  import AddFrameModal from "$lib/components/modals/AddFrameModal.svelte"
  import AboutModal from "$lib/components/modals/AboutModal.svelte"

  import { walletStore } from "$lib/walletStore.svelte"
  import { page } from "$app/state"
  import { slide } from "svelte/transition"
  import { SvelteToast } from "@zerodevx/svelte-toast"
  import { user } from "$lib/userStore.svelte"
  import {
    displayNameStore,
    updateDisplayName,
  } from "$lib/displayNameStore.svelte"
  import { frameStore } from "$lib/farcaster/frameStore.svelte"
  import type { FrameContext } from "@farcaster/frame-sdk"
  import type { EvmAddress } from "$lib"

  /**
   * TODO:
   For launch:
   * - Fix get or create caching bug
   * - Testnet with a mainnet RPC endpoint (test websockets, test sync)
   * - Add disclaimer to warn that contracts have not been audited and interface failures are possible (probably want 
   *   to have a 'check to agree' for this)
   * 
   * Deployment todos:
   * - Remove testnet drip logic
   * - Add splits contract to collect fees
   * - Add a limit to the bet size (UI only)
   *
   Nice to haves:
   * - Set up system to notify when a user has won a game
   * - The 'cancel game' card button should take you directly the 'cancel game' modal
   *
   * - getOrCreateGame cache issue is still present, where you can switch your wallet and get the solution from your opponent.
   *    i think this happens because after switching wallet, the backend will still serve with the cache key from
   *    the previous wallet. Maybe this could be fixed my forcing a logout when the wallet switches
   *
   * - On 'liveGame' the 'back' button should include all the top left text
   * - Cbsw popup window still fails to open on mobile
   * - Should stop the user from creating a game with 0 balance
   * - It is weird/inconvenient to newcomers when you need a wallet popup for every action
   */

  let { children } = $props()

  console.log("[pre-auth address]", page.data.user)
  if (!user.authenticated && page.data.user) {
    user.authenticated = page.data.user
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
    fcUser: FrameContext["user"],
  ) => {
    const fcName = fcUser.displayName || fcUser.username
    const pbName = await displayNameStore.fetch(forUser)

    if (!pbName && fcName) {
      updateDisplayName(forUser, fcName)
    }
  }

  $effect(() => {
    if (frameStore.initialized && user.authenticated) {
      frameStore.addFrame()

      // This is not an authenticated user context and can be spoofed, but we don't really care because this is
      // only used for setting display names and sending notifications
      if (!user.fid) {
        user.associateFid(frameStore.context!.user.fid)
      }

      maybeSetFarcasterName(user.authenticated, frameStore.context!.user)
    }
  })

  let isHomePage = $derived(page.url.pathname === "/")
  let isGamePath = $derived(page.url.pathname.startsWith("/game"))
</script>

<!-- prettier-ignore -->
<svelte:head>
  {#if !page.url.pathname.includes("join")}
    <title>Puzzle Bets - Compete with friends</title>
    <meta property="og:title" content="Puzzle Bets - Compete with friends" />
    <meta name="description" content="Play wagered Wordle matches with friends" />
    <meta property="og:description" content="Play wagered Wordle matches with friends" />

    <meta
      name="fc:frame"
      content={JSON.stringify({
        version: "next",
        imageUrl: `https://puzzlebets.xyz/home-splash-landscape.png`,
        button: {
          title: "Launch",
          action: {
            type: "launch_frame",
            name: "launch",
            url: page.url.href,
            iconImageUrl: `https://puzzlebets.xyz/character-logo.png`,
            splashImageUrl: `https://puzzlebets.xyz/character1.png`,
            splashBackgroundColor: "#FFC700",
          },
        },
      })}
    />
  {/if}
</svelte:head>

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
