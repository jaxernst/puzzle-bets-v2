<script lang="ts">
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import { type EvmAddress } from "$lib/types"
  import { displayNameStore } from "$lib/displayNameStore.svelte"

  let { opponent, pending } = $props<{
    opponent: EvmAddress | null
    pending?: boolean
  }>()

  let opponentName = $derived(opponent && displayNameStore.get(opponent))
</script>

<div class="flex items-center justify-center gap-2">
  <div class="flex items-center gap-1">
    <Avatar1 />
    You
  </div>

  vs

  <div class="flex items-center gap-1">
    <Avatar2 />
    {#if opponent}
      {opponentName}
    {:else if pending}
      Pending...
    {:else}
      Nobody
    {/if}
  </div>
</div>
