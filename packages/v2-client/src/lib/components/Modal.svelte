<script lang="ts">
  import { browser } from "$app/environment"
  import { createEventDispatcher } from "svelte"
  import { onMount } from "svelte"
  import { cubicOut } from "svelte/easing"
  import { fade } from "svelte/transition"

  export let show: boolean
  export let title: string = ""
  export let description: string = ""

  const dispatch = createEventDispatcher()

  let modal: HTMLElement

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal()
      }
    }

    window.addEventListener("keydown", handleKeydown)

    return () => {
      window.removeEventListener("keydown", handleKeydown)
    }
  })

  $: if (show) {
    // Focus on the modal when it becomes visible
    modal?.focus()
  }

  function closeModal() {
    dispatch("close")
  }

  function clickOutside(event: MouseEvent) {
    if (event.target === modal) {
      closeModal()
    }
  }

  function setThemeColor(color: string) {
    let metaThemeColor = document.querySelector("meta[name=theme-color]")
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color)
    } else {
      metaThemeColor = document.createElement("meta")
      metaThemeColor.setAttribute("name", "theme-color")
      metaThemeColor.setAttribute("content", color)
      document.getElementsByTagName("head")[0].appendChild(metaThemeColor)
    }
  }

  // Hack to darken the notch area (by 30%) on ios
  const initThemeColor = "rgb(230, 230, 232)"
  $: if (show) {
    browser && setThemeColor("rgb(161, 161, 162.4)")
  } else {
    browser && setThemeColor(initThemeColor)
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    transition:fade={{ duration: 150, easing: cubicOut }}
    bind:this={modal}
    tabindex="-1"
    class="modal fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black bg-opacity-30"
    style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);"
    on:click={clickOutside}
    aria-modal="true"
    role="dialog"
    aria-labelledby={title}
    aria-describedby={description}
  >
    <slot />
  </div>
{/if}
