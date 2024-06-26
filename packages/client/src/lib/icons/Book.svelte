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
    d="M4.5625 14.625V3.75C4.5625 2.92157 5.23407 2.25 6.0625 2.25H14.6125C14.8611 2.25 15.0625 2.45147 15.0625 2.7V15.75"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M7.5625 5.25H12.0625"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M5.6875 11.25H15.0625"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M5.6875 13.5H15.0625"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M5.6875 15.75H15.0625"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M5.6875 13.5C4.9375 13.5 4.5625 12.9963 4.5625 12.375C4.5625 11.7537 4.9375 11.25 5.6875 11.25"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M5.6875 15.75C4.9375 15.75 4.5625 15.2463 4.5625 14.625C4.5625 14.0037 4.9375 13.5 5.6875 13.5"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
