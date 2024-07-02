<script lang="ts">
  import { twMerge } from "tailwind-merge"
  let { class: className } = $props<{ class?: string }>()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  class={twMerge("h-[19px] w-[19px]", className)}
  viewBox="0 0 19 18"
  fill="none"
>
  <path
    d="M12.375 9H13.425C13.6735 9 13.875 9.20145 13.875 9.45V14.55C13.875 14.7985 13.6735 15 13.425 15H5.325C5.07647 15 4.875 14.7985 4.875 14.55V9.45C4.875 9.20145 5.07647 9 5.325 9H6.375M12.375 9V6C12.375 5 11.775 3 9.375 3C6.975 3 6.375 5 6.375 6V9M12.375 9H6.375"
    stroke="white"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
