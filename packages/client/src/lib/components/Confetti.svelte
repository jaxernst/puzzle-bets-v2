<script context="module">
  import { browser } from "$app/environment"
  import { prefersReducedMotion } from "$lib/accessibility"
  import { writable, derived } from "svelte/store"

  const trigger = writable(0)

  export const launchConfetti = () => {
    trigger.update((n) => n + 1)
  }

  // Using writable stores to dynamically update stage dimensions
  let stageWidth = writable(800)
  let stageHeight = writable(2000)

  // Update stage dimensions based on browser environment
  if (browser) {
    // Immediately set initial values
    stageWidth.set(window.innerWidth)
    stageHeight.set(window.innerHeight * 1.4)

    // Update dimensions on window resize
    window.addEventListener("resize", () => {
      stageWidth.set(window.innerWidth)
      stageHeight.set(window.innerHeight * 1.4)
    })
  }
</script>

<script>
  import { confetti } from "@neoconfetti/svelte"
</script>

{#key $trigger}
  {#if $trigger}
    <div
      style="position: fixed; left: 50%; top: 30%"
      use:confetti={{
        particleCount: $prefersReducedMotion ? 0 : 120,
        force: 0.7,
        stageWidth: $stageWidth / 1.5,
        stageHeight: $stageHeight,
        colors: ["#EACB28", "#E2E4F4", "#FEECC8", "#2FB163"],
      }}
    ></div>
  {/if}
{/key}
