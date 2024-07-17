<script>
  import { hideControls } from "../game-controller/GameController.svelte"

  let { children } = $props()

  $effect(hideControls)
</script>

{@render children()}
