<script lang="ts">
  import { goto } from "$app/navigation"
  import PuzzleBetsMoneyLogo from "$lib/assets/PuzzleBetsMoneyLogo.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import { user } from "$lib/userStore.svelte"

  let showAboutModal = $state(false)

  const connect = async () => {
    try {
      await promptConnectWallet()
      goto("/dashboard")
    } catch {}
  }
</script>

<Modal bind:show={showAboutModal} title="About puzzle bets"
  ><div class="flex flex-col gap-6 rounded-md bg-white">
    <div class="font-bold">What is Puzzle Bets?</div>
    <div>
      <h2>Onchain Puzzle PvP Arenas</h2>
      <div class="flex-grow">
        Puzzle Bets is a player vs player onchain arena. Players challenge each
        other in winner-takes-all games with wagers on who can solve the
        puzzles.
      </div>
    </div>

    <hr />

    <div class="flex justify-between">
      <h2>How to Play</h2>
      <div>Expand</div>
    </div>

    <hr />

    <div>
      <h2>About Puzzle Bets</h2>
      PuzzleBEts isbeing developed in the open! All code, including the smart contracts,
      backend, and frontend are open source and available on Github.
    </div>
  </div>
</Modal>

<img
  class="absolute left-1/2 top-1/4 hidden h-[306px] w-[293px] -translate-x-[480px] sm:block"
  src="/character2.png"
  alt="Puzzle Character 2"
/>

<img
  class="absolute left-1/2 top-[150px] hidden h-[377px] w-[367px] translate-x-[180px] sm:block"
  src="/character1.png"
  alt="Puzzle Character 1"
/>

<div class="flex h-full w-full flex-col justify-between">
  <div
    class="flex w-full flex-grow flex-col items-center justify-evenly gap-4 pt-4"
  >
    <div class="overflow-none flex items-center gap-14 sm:hidden">
      <img
        class="w-[162px] -translate-x-4"
        src="/character2.png"
        alt="Puzzle Character 2"
      />
      <img class="w-[230px]" src="/character1.png" alt="Puzzle Character 1" />
    </div>

    <div class="flex flex-col items-center gap-4">
      <div class="rounded-full border-2 border-black px-2">
        Testnet <span class="font-bold">Beta</span>
      </div>

      <PuzzleBetsMoneyLogo class="h-[175px] sm:h-[251px]" />

      <div class="font-angkor text-angkor flex flex-col items-center">
        <div>Play Puzzles.</div>
        <div>Compete with Friends.</div>
      </div>
    </div>

    <div class="flex flex-col gap-1.5 text-center font-bold">
      <button
        onclick={connect}
        class="rounded border-white bg-black px-3 py-2 text-white"
      >
        {#if !user.address}
          Connect and Play
        {:else}
          Enter
        {/if}
      </button>

      <a href="/dashboard" class="rounded border-2 border-black px-3 py-2">
        Play a Practice Game
      </a>

      <button class="p-3 font-bold" onclick={() => (showAboutModal = true)}>
        What is Puzzle Bets?
      </button>
    </div>
  </div>

  <div class="hidden justify-center justify-self-end sm:flex">
    <img src={"/hand-ok.png"} alt="Hand Pointing Up" />
  </div>
</div>
