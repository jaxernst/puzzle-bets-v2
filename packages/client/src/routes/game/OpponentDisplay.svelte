<script lang="ts">
  import Avatar1 from "$lib/assets/Avatar1.svelte"
  import Avatar2 from "$lib/assets/Avatar2.svelte"
  import { type EvmAddress } from "$lib/types"
  import { Map } from "svelte/reactivity"

  const displayNameStore = (() => {
    let store = $state(new Map())

    const fetchName = async (user: EvmAddress) => {
      const names = ["Murph", "jaxernst", "w3sker"]
      const i = Math.floor(Math.random() * names.length)
      const name = names[i]

      setTimeout(() => {
        store.set(user, name)
      }, 100)
    }

    return {
      get: (user: EvmAddress) => {
        const name = store.get(user)
        if (!name) {
          fetchName(user)
        }
        return name ?? user
      },
    }
  })()

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
