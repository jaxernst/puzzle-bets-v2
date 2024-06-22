<script lang="ts">
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import { type EvmAddress } from "$lib/types"

  let { opponent } = $props<{ opponent: EvmAddress | null }>()
</script>

<div class="flex items-center justify-center gap-2">
  <div class="flex items-center gap-1">
    <Avatar1 />
    You
  </div>

  vs

  <div class="flex items-center gap-1">
    <Avatar2 />
    Nobody
  </div>
</div>
