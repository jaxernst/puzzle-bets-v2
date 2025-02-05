<script>
  import { mud } from "$lib/mudStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import { networkConfig } from "$lib/mud/networkConfig"

  const entryDelay = 200

  const progressRingSize = 22
  const progressRingStrokeWidth = 4
  const radius = (progressRingSize - progressRingStrokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  let progress = $derived(mud.syncProgress)
  let strokeDashoffset = $derived(
    circumference - (progress / 100) * circumference,
  )

  let started = $state(false)
  let synced = $derived(mud.synced)

  $effect(() => {
    setTimeout(() => {
      started = true
    }, entryDelay)
  })
</script>

{#snippet progressRing()}
  <div class="relative inline-flex items-center justify-center">
    <svg
      class="-rotate-90 transform"
      width={progressRingSize}
      height={progressRingSize}
    >
      <!-- Background circle -->
      <circle
        class="stroke-gray-200"
        stroke="currentColor"
        fill="transparent"
        stroke-width={progressRingStrokeWidth}
        r={radius}
        cx={progressRingSize / 2}
        cy={progressRingSize / 2}
      />
      <!-- Progress circle -->
      <circle
        class="stroke-black transition-all duration-300 ease-in-out"
        stroke="currentColor"
        fill="transparent"
        stroke-width={progressRingStrokeWidth}
        stroke-dasharray={circumference}
        stroke-dashoffset={strokeDashoffset}
        stroke-linecap="round"
        r={radius}
        cx={progressRingSize / 2}
        cy={progressRingSize / 2}
      />
    </svg>
  </div>
{/snippet}

<div
  class={`
    bg-pb-off-white fixed left-1/2 isolate z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-2 py-1.5 text-base font-semibold
      transition-all duration-150 ease-in-out 
      ${!user.address || mud.syncProgress === null || !started || synced ? "-top-10" : "top-4 shadow-md"}
  `}
>
  {@render progressRing()}
  Syncing with {networkConfig.chain.name}...
</div>
