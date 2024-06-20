<script>
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { fade, slide } from "svelte/transition"
  import { page } from "$app/stores"
  import { cubicOut } from "svelte/easing"
  import Warpcast from "$lib/icons/Warpcast.svelte"
  import Github from "$lib/icons/Github.svelte"

  $: path = $page.url.pathname
  const slideDuration = 450
</script>

<svelte:head>
  <title>Puzzle Bets | About</title>
  <meta property="og:title" content="Puzzle Bets | About" />
</svelte:head>

<div class="relative col-start-1 row-start-1">
  <div
    class="absolute bottom-0 left-0 col-start-1 h-full w-full"
    transition:slide={{ duration: slideDuration, easing: cubicOut }}
  >
    <a
      href="/welcome"
      class="flex w-full items-center justify-center text-center font-semibold text-neutral-500"
      in:fade={{ delay: slideDuration / 8 }}
    >
      Return home
      <AnimatedArrow
        direction={path === "/about" ? "up" : "down"}
        class="h-5 w-5 fill-neutral-600 stroke-neutral-400"
      />
    </a>

    <h1 class="my-4 text-2xl font-semibold text-neutral-800">The Game</h1>

    <p class="py-1 font-medium text-neutral-600">
      Puzzle bets is a player vs player onchain competitive puzzle game. Players
      can challenge each other to puzzles, and place wagers on the results.
    </p>

    <p class="mt-3 py-1 font-medium text-neutral-600">
      Currently, only Wordle is supported, but more puzzles are coming soon!
    </p>

    <h2 class="mt-4 text-xl font-bold text-lime-500">How to Play</h2>
    <p class="py-1 font-medium text-neutral-600">
      Players challenge each other by creating games and sharing invite links.
      To initiate a game, a player deposits their wager into a smart contract,
      the game gets created, and an invite link is generated. After sharing this
      invite link, the second player can join and start the game. Once started,
      an identical puzzle is revealed for both players and the clock starts
      ticking.
    </p>

    <h2 class="mt-4 text-xl font-bold text-lime-500">Winning the pot</h2>

    <p class="py-1 font-medium text-neutral-600">
      Different puzzles will have different criteria to determine a victor.
      Currently, only <span class="font-bold">Wordle</span> is supported. In order
      to win the Wordle pot, you must solve the Wordle before the deadline with the
      fewest number of attempts. In the event of a tie, the game may be restarted
      until a victor emerges.
    </p>

    <h1 class="mb-4 mt-6 text-2xl font-semibold text-neutral-800">
      The Project
    </h1>

    <p class="py-1 font-medium text-neutral-600">
      Puzzle bets is being developed in the open! All code, including the smart
      contracts, backend, and frontend are open source and available on Github
    </p>

    <p class="py-1 font-medium text-neutral-600">
      This is an early, unofficial testnet release of Puzzle Bets. Any feedback
      or bugs reports are welcome on github, Farcaster, or Twitter.
    </p>

    <h2 class="mt-4 text-xl font-bold text-lime-500">Follow For Updates</h2>

    <div class="flex flex-col gap-4 px-2 py-4">
      <a
        href="https://warpcast.com/~/channel/puzzlebets"
        class="flex items-center gap-2 font-bold text-purple-800"
      >
        <div class="h-6 w-6">
          <Warpcast />
        </div>
        Puzzle Bets on Farcaster
      </a>

      <a
        href="https://github.com/jaxernst/puzzle-bets"
        class="flex items-center gap-2 font-bold text-neutral-800"
      >
        <div class="h-6 w-6">
          <Github />
        </div>
        Puzzle Bets source code
      </a>

      <p
        class="flex w-full justify-center gap-2 p-4 font-medium text-neutral-600"
      >
        By
        <a
          href="https://jaxer.eth.co"
          class="font-bold text-blue-600"
          target="_blank"
        >
          jaxer.eth.co
        </a>
        :)
      </p>
    </div>
    <div class="h-[80px]"></div>
  </div>
</div>
