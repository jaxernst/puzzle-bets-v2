<script>
  import { hideControls } from "../../game-controller/GameController.svelte"

  $effect(hideControls)
</script>

<slot />
