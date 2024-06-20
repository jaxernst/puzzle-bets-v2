<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import { slide } from "svelte/transition"
  import AnimatedArrow from "./AnimatedArrow.svelte"
  import { browser } from "$app/environment"

  export let options: string[]
  export let placeholder = "Select an Option"
  export let onOptionSelect: (option: string) => void = () => {}
  export let selection: string | null = null

  let isOpen = false

  const toggleDropdown = () => {
    isOpen = !isOpen
  }

  const selectOption = async (option: string) => {
    selection = option
    setTimeout(() => {
      onOptionSelect(option)
      isOpen = false
    }, 10)
  }

  let dropdownButton: HTMLDivElement

  const handleClickOutside = (event: any) => {
    if (!dropdownButton.contains(event.target)) {
      isOpen = false
    }
  }

  onMount(() => {
    if (!browser) return
    document.addEventListener("click", handleClickOutside)
  })

  onDestroy(() => {
    if (!browser) return
    document.removeEventListener("click", handleClickOutside)
  })
</script>

<div
  class="relative overflow-visible text-sm text-white"
  bind:this={dropdownButton}
>
  <button
    class="bg-pb-yellow flex items-center justify-between gap-1 whitespace-nowrap rounded-lg p-2 font-semibold"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    transition:slide={{ axis: "x" }}
    on:click={toggleDropdown}
  >
    {selection ?? placeholder}
    <AnimatedArrow
      direction={isOpen ? "up" : "down"}
      class="h-5 w-5 fill-white"
    />
  </button>
  <div class="absolute left-0 z-50 mt-2 rounded-lg shadow">
    {#if isOpen}
      <ul
        transition:slide
        class="flex flex-col rounded-lg bg-neutral-800 font-semibold"
        role="listbox"
        tabindex="-1"
      >
        {#each options as option}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class={`rounded-[.36rem] ${
              option === selection
                ? "bg-pb-yellow"
                : "transition-color hover:bg-neutral-700"
            }`}
            role="option"
            aria-selected={selection === option}
          >
            <button class="px-4 py-2" on:click={() => selectOption(option)}>
              {option}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
