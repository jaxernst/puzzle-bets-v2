<script lang="ts">
  import Puzzly from "$lib/icons/Puzzly.svelte"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { tweened } from "svelte/motion"
  import { cubicOut } from "svelte/easing"
  import PuzzlePiece from "$lib/icons/PuzzlePiece.svelte"
  import { clickOutside } from "$lib/actions/clickOutside"

  const SIZE_CLOSED = 70
  const SIZE_OPEN = 600

  const size = tweened(SIZE_CLOSED, {
    duration: 300,
    easing: cubicOut,
  })

  const toggleExpand = () => {
    console.log("Expand")
    if ($size === SIZE_CLOSED) {
      $size = SIZE_OPEN
    } else {
      $size = SIZE_CLOSED
    }
  }
</script>

<div
  onclick={toggleExpand}
  onkeydown={(event) => event.key === "Enter" && toggleExpand()}
  use:clickOutside={{
    enabled: $size === SIZE_OPEN,
    cb: () => ($size = SIZE_CLOSED),
  }}
  tabindex="0"
  class="bg-slate-200"
  role="button"
  style={`height: ${$size}px;`}
>
  <div class="flex items-center gap-2 p-4 font-bold">
    <PuzzlePiece class="h-8 w-8" />
    Dashboard

    <div class="flex flex-grow justify-end">
      <AnimatedArrow class="h-6 w-6 font-bold" direction="up" />
    </div>
  </div>
</div>
