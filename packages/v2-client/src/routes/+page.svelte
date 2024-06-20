<script>
  import GameStartCard from "./GameStartCard.svelte"
</script>

<div
  class="size absolute left-1/2 top-[40vh] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
>
  <a href="/connect" class="rounded-md bg-black px-3 py-2 text-white">
    Connect to Play
  </a>
</div>

<div class="h-[40vh]"></div>

<div class="h-20"></div>

<div class="flex flex-wrap justify-center gap-5 px-10">
  <GameStartCard game="wordle" />
  <GameStartCard game="crossword" disabled={true} />
  <GameStartCard game="connections" disabled={true} />
  <GameStartCard game="sudoku" disabled={true} />
</div>

<style>
  .size {
    height: 70px;
    width: 180px;
  }
</style>
