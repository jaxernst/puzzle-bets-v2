<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte"

  let {
    onClick,
    disabled = false,
    class: className,
    children,
  } = $props<{
    onClick: () => Promise<void>
    disabled?: boolean
    class?: string
    children: any
  }>()

  let loading = $state(false)

  const handleClick = async () => {
    if (disabled || loading) return

    loading = true

    try {
      await onClick()
    } finally {
      loading = false
    }
  }
</script>

<button
  class={`flex items-center justify-center ${className}`}
  onclick={handleClick}
  {disabled}
>
  {#if loading}
    <DotLoader class="fill-current" />
  {:else}
    {@render children()}
  {/if}
</button>
