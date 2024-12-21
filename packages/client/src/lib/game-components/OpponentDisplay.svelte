<script lang="ts">
  import Avatar1 from "$lib/svg-components/Avatar1.svelte"
  import Avatar2 from "$lib/svg-components/Avatar2.svelte"
  import { type EvmAddress } from "$lib/types"
  import { displayNameStore } from "$lib/displayNameStore.svelte"
  import { shortenAddress } from "$lib/util"

  let { opponent, pending } = $props<{
    opponent: EvmAddress | null
    pending?: boolean
  }>()

  let opponentName = $derived.by(() => {
    if (pending) return "Pending..."
    if (!opponent) return "Nobody"

    const name = displayNameStore.get(opponent, false)
    return name ?? shortenAddress(opponent)
  })
</script>

<div class="flex items-center justify-center gap-2">
  <div class="flex items-center gap-1">
    <Avatar1 />
    You
  </div>

  vs

  <div class="flex items-center gap-1">
    <Avatar2 />
    {opponentName}
  </div>
</div>
