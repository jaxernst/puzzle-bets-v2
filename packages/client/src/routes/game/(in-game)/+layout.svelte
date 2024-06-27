<script>
  import { hideControls } from "../../GameController.svelte"

  $effect(hideControls)
</script>

<slot />
