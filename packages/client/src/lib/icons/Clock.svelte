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
    d="M9.6875 4.5V9H14.1875"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M9.6875 16.5C13.8296 16.5 17.1875 13.1421 17.1875 9C17.1875 4.85786 13.8296 1.5 9.6875 1.5C5.54536 1.5 2.1875 4.85786 2.1875 9C2.1875 13.1421 5.54536 16.5 9.6875 16.5Z"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
