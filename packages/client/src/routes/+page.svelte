<script lang="ts">
  import PuzzleBetsMoneyLogo from "$lib/assets/PuzzleBetsMoneyLogo.svelte"
  import Modal from "$lib/components/Modal.svelte"

  let showAboutModal = $state(false)
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

<div class="flex h-full w-full flex-col items-center gap-2">
  <div class="flex h-2/3 items-center p-6">
    <PuzzleBetsMoneyLogo />
  </div>

  <div class="flex flex-col gap-3 text-center">
    <a href="/me" class="border-white bg-black p-3 text-lg text-white">
      Connect and Play
    </a>

    <a href="/game/select" class="border-black bg-white p-3 text-lg">
      Play a Practice Game
    </a>

    <button class="p-3 font-bold" onclick={() => (showAboutModal = true)}>
      What is Puzzle Bets?
    </button>
  </div>
</div>
