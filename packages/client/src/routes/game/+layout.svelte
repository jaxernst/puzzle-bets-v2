<script>
  import { hideControls } from "../game-controller/GameController.svelte"

  let { children } = $props()

  $effect(hideControls)
</script>

<div class="h-full pt-4">
  {@render children()}
</div>
