<script lang="ts">
  import { twMerge } from "tailwind-merge"
  let { class: className } = $props<{ class?: string }>()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  class={twMerge("h-[18px] w-[19px]", className)}
  viewBox="0 0 19 18"
  fill="none"
>
  <path
    d="M15.3375 12.75L16.6875 5.25L11.9625 7.5L9.9375 5.25L7.9125 7.5L3.1875 5.25L4.5375 12.75H15.3375Z"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
