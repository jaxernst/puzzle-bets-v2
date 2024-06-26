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
  <g clip-path="url(#clip0_198_380)">
    <path
      d="M9.875 16.5C5.73286 16.5 2.375 13.1421 2.375 9C2.375 4.85786 5.73286 1.5 9.875 1.5C14.0171 1.5 17.375 4.85786 17.375 9C17.375 13.1421 14.0171 16.5 9.875 16.5Z"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M13.25 10.875C13.25 10.875 12.125 12.375 9.875 12.375C7.625 12.375 6.5 10.875 6.5 10.875"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12.5 6.75C12.2929 6.75 12.125 6.5821 12.125 6.375C12.125 6.16789 12.2929 6 12.5 6C12.7071 6 12.875 6.16789 12.875 6.375C12.875 6.5821 12.7071 6.75 12.5 6.75Z"
      fill="black"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M7.25 6.75C7.04289 6.75 6.875 6.5821 6.875 6.375C6.875 6.16789 7.04289 6 7.25 6C7.4571 6 7.625 6.16789 7.625 6.375C7.625 6.5821 7.4571 6.75 7.25 6.75Z"
      fill="black"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
  <defs>
    <clipPath id="clip0_198_380">
      <rect width="18" height="18" fill="white" transform="translate(0.875)" />
    </clipPath>
  </defs>
</svg>
