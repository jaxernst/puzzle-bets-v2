<script>
  import { twMerge } from "tailwind-merge"

  let overrideClass = ""

  export { overrideClass as class }
</script>

<button
  on:click
  class={twMerge(
    "rounded-lg border border-lime-500 px-2 py-1 font-semibold text-lime-500 transition-all hover:border-lime-400 active:border-lime-600",
    overrideClass,
  )}
>
  <slot />
</button>
