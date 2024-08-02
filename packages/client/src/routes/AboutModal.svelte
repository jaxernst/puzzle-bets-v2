<script context="module">
  import Modal from "$lib/components/Modal.svelte"
  import PuzzlePiece from "$lib/icons/PuzzlePiece.svelte"

  let showAboutModal = $state(false)

  export function toggleAboutModal() {
    showAboutModal = !showAboutModal
  }
</script>

<Modal bind:show={showAboutModal}>
  {#snippet header()}
    <div class="flex items-center gap-1">
      <PuzzlePiece />
      <div class="font-bold">What is Puzzle Bets?</div>
    </div>
  {/snippet}

  <div>
    <h2>Onchain Puzzle PvP Arenas</h2>
    <div class="flex-grow">
      Puzzle Bets is a player vs player onchain arena. Players challenge each
      other in winner-takes-all games with wagers on who can solve the puzzles.
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
</Modal>
