<script>
  import Wordle from "$lib/game-components/Wordle.svelte"
  import GameHeader from "../../GameHeader.svelte"
  import OpponentDisplay from "../../OpponentDisplay.svelte"
</script>

<div class=" flex flex-col gap-4 p-4">
  <GameHeader puzzle="wordle" />
  <OpponentDisplay opponent={null} />
  <Wordle />
</div>
