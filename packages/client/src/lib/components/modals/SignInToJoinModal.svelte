<script>
  import Modal from "../Modal.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import { capitalized } from "$lib/util"
  import { promptConnectWallet } from "../WalletConnector.svelte"

  const { show } = $props()

  const puzzleType = "wordle"
</script>

<Modal {show} class="sm:w-[375px]" onClose={() => (showNoUser = true)}>
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Stars />
      You've been invited!
    </div>
  {/snippet}

  <div class="font-bold">Sign in to Puzzle Bets to accept the invite</div>

  <div class="text-sm leading-tight">
    After signing in, you can view your invite, put down your wager, and play
    your opponent in a competitive {capitalized(puzzleType)} game.
  </div>

  <hr />

  <button
    onclick={promptConnectWallet}
    class="rounded bg-black p-2 font-bold text-white">Continue</button
  >
</Modal>
