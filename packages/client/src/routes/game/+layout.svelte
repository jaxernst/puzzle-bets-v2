<script>
  import { hideControls } from "../game-controller/GameController.svelte"

  let { children } = $props()

  $effect(hideControls)
</script>

<div class="pt-4">
  {@render children()}
</div>
