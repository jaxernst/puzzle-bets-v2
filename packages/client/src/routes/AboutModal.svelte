<script context="module">
  import Modal from "$lib/components/Modal.svelte"

  let showAboutModal = $state(false)

  export function toggleAboutModal() {
    showAboutModal = !showAboutModal
  }
</script>

<Modal bind:show={showAboutModal} title="About puzzle bets"
  ><div class="bg-off-white flex flex-col gap-6 rounded-md">
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
