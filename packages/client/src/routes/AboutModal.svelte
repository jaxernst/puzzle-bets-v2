<script context="module">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import PuzzlePiece from "$lib/icons/PuzzlePiece.svelte"
  import Warpcast from "$lib/icons/Warpcast.svelte"
  import Github from "$lib/icons/Github.svelte"
  import { slide } from "svelte/transition"

  let showAboutModal = $state(false)

  export function toggleAboutModal() {
    showAboutModal = !showAboutModal
  }

  let showHowToPlay = $state(false)
</script>

<Modal bind:show={showAboutModal}>
  {#snippet header()}
    <div class="flex items-center gap-1">
      <PuzzlePiece />
      <div class="font-black">What is Puzzle Bets?</div>
    </div>
  {/snippet}

  <div>
    <h2 class="mb-4 text-lg font-black leading-none">
      Onchain Puzzle PvP Arenas
    </h2>
    <div class="flex-grow leading-tight">
      Puzzle Bets is an onchain player vs player puzzle game where players
      challenge each other in timed, winner-takes-all matches.
    </div>
  </div>

  <hr />

  <div class="flex items-center justify-between">
    <h2 class="text-lg font-black leading-none">How to Play</h2>
    <button
      class="bg-pb-yellow flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold"
      onclick={() => (showHowToPlay = !showHowToPlay)}
    >
      <AnimatedArrow
        direction={showHowToPlay ? "up" : "down"}
        class="h-4 stroke-black"
      />
      Expand
    </button>
  </div>

  {#if showHowToPlay}
    <div transition:slide class="flex flex-col gap-3 text-base leading-tight">
      <p>
        Create games and challenge your friends by sending them an invite link,
        or create public games for anyone to join through the game lobby.
        Players deposit the wager into a smart contract, and each player gets a
        shot at solving an identical puzzle. Solve the puzzle before the
        deadline for a shot at victory!
      </p>

      <h3 class="font-black">Creating Games</h3>

      <p>
        Create a public or private game. Private games require an invite link to
        join, while public games are joinable by anyone.
      </p>

      <h3 class="font-black">Winning Games & Scoring</h3>

      <p>
        You must submit before the deadline for your score to count, however
        <span class="underline">puzzles are not scored based on speed.</span> Wordle,
        for example, is scored based on who solves with the fewest attempts.
      </p>

      <h3 class="font-black">Starting Your Turn</h3>

      <p>
        <span class="underline">When joining a game:</span> As soon as you join a
        game, your puzzle is revealed and your timer starts.
      </p>

      <p>
        <span class="underline">When creating a game:</span> As the game creator,
        you will have 12 hours to start your turn after your opponent joins.
      </p>

      <h3 class="font-black">Cancelling Games</h3>

      <p>
        Your created games can be cancelled at any time before your opponent
        joins, and your deposit will be reutrned. Once your opponent joins, the
        wagers are locked until the game is over.
      </p>
    </div>
  {/if}

  <hr />

  <div class="flex flex-col gap-6">
    <h2 class="text-lg font-black leading-none">About Puzzle Bets</h2>

    Puzzle Bets is being developed in the open! All code, including the smart
    contracts, puzzle backend, and frontend are open source and available on
    Github.

    <div class="flex items-center gap-4">
      <a
        href="https://warpcast.com/~/channel/puzzlebets"
        target="_blank"
        class="h-8 w-8"
      >
        <Warpcast />
      </a>

      <a
        href="https://github.com/jaxernst/puzzle-bets"
        target="_blank"
        class="h-8 w-8"
      >
        <Github />
      </a>
    </div>

    <div class="flex items-center gap-1">
      Created by
      <a
        href="https://x.com/yachtyyachty"
        target="_blank"
        class="mr-1 rounded-full bg-black px-2 py-0.5 text-white">jaxer.eth</a
      >
      Designed by
      <a
        href="https://x.com/Lil_w3sker"
        target="_blank"
        class="rounded-full bg-black px-2 py-0.5 text-white">w3sker.eth</a
      >
    </div>
  </div></Modal
>
