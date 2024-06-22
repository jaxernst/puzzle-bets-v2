<script lang="ts">
  import { twMerge } from "tailwind-merge";
  let { class: className } = $props<{ class?: string }>();
</script>

<svg
  class={twMerge("w-[16px] h-[16px]", className)}
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M12.6667 13.3334H3.33333C2.59695 13.3334 2 12.7365 2 12.0001V6.00008C2 5.2637 2.59695 4.66675 3.33333 4.66675H12.6667C13.4031 4.66675 14 5.2637 14 6.00008V12.0001C14 12.7365 13.4031 13.3334 12.6667 13.3334Z"
    stroke="black"
    stroke-width="1.5"
  />
  <path
    d="M10.9998 9.33341C10.8158 9.33341 10.6665 9.18415 10.6665 9.00008C10.6665 8.81601 10.8158 8.66675 10.9998 8.66675C11.1839 8.66675 11.3332 8.81601 11.3332 9.00008C11.3332 9.18415 11.1839 9.33341 10.9998 9.33341Z"
    fill="black"
    stroke="black"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M12 4.66662V3.73543C12 2.85939 11.1696 2.22139 10.3231 2.44711L2.98978 4.40268C2.40611 4.55832 2 5.08692 2 5.69099V5.99995"
    stroke="black"
    stroke-width="1.5"
  />
</svg>
