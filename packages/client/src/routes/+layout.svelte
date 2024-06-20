<script lang="ts">
  import "./styles.css"
  import { page } from "$app/stores"
  import WalletConnector from "$lib/components/wallet/WalletConnector.svelte"
  import GameSelector from "./game-selector/GameSelector.svelte"
  import AppHeader from "./AppHeader.svelte"
  import Confetti from "$lib/components/Confetti.svelte"
  import { user } from "$lib/userStore"
  import { slide } from "svelte/transition"
  import GameDropdownControls from "./GameDropdownControls.svelte"
  import { onMount } from "svelte"
  import { walletStore } from "$lib/walletStore"
  import { mud } from "$lib/mud/mudStore"
  import { PUBLIC_CHAIN_ID } from "$env/static/public"
  import { networkConfig } from "$lib/mud/networkConfig"

  const gameNames = ["Wordle", "Connections", "Crossword", "Sudoku"]

  $: gameRoute = gameNames.find((game) =>
    $page.url.pathname.includes("games/" + game.toLowerCase()),
  )

  const homeRoutes = ["/", "/welcome", "/about"]

  onMount(async () => {
    if (networkConfig.connectMode === "burner") return

    console.log("Attempting to connect with chainId", PUBLIC_CHAIN_ID)
    try {
      const w = await walletStore.tryConnect("auto")
      w && mud.setup(w)
    } catch {
      console.log("Auto connect failed")
    }
  })
</script>

<WalletConnector />
<Confetti />

<div class="fixed h-full w-full">
  <main class="mx-auto flex h-full max-w-[36rem] flex-col text-white">
    {#if $user.address || !homeRoutes.includes($page.url.pathname)}
      <section in:slide class="px-3 pt-2">
        <AppHeader />
      </section>
    {/if}

    <div class="flex flex-grow flex-col gap-4 overflow-y-auto p-3">
      <section class="flex flex-wrap items-center gap-2 gap-y-1">
        <GameDropdownControls />
      </section>

      {#if $page.url.pathname.includes("games")}
        <div class="flex justify-center">
          <hr class="w-3/4 border-t border-neutral-300" />
        </div>
      {/if}

      <section class="flex flex-grow flex-col">
        <slot />
      </section>
    </div>
    {#if $user.address}
      <section>
        <GameSelector />
      </section>
    {/if}
  </main>
</div>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 40rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
