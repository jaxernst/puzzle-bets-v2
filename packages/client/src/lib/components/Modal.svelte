<script lang="ts">
  import { browser } from "$app/environment"
  import { onMount } from "svelte"
  import { cubicInOut, cubicOut } from "svelte/easing"
  import { fade, fly } from "svelte/transition"
  import { twMerge } from "tailwind-merge"

  let {
    show = $bindable(),
    title,
    description,
    children,
    class: className = "sm:min-h-[500px] sm:w-[500px]",
  } = $props<{
    show: boolean
    title?: string
    description?: string
    children: any
    class?: string
  }>()

  let modal = $state<HTMLElement>()

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        show = false
      }
    }

    window.addEventListener("keydown", handleKeydown)

    return () => {
      window.removeEventListener("keydown", handleKeydown)
    }
  })

  $effect(() => {
    if (show) modal?.focus()
  })

  function clickOutside(event: MouseEvent) {
    if (event.target === modal) {
      show = false
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
  $effect(() => {
    if (show) {
      browser && setThemeColor("rgb(161, 161, 162.4)")
    } else {
      browser && setThemeColor(initThemeColor)
    }
  })
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    in:fade={{ duration: 150, easing: cubicOut }}
    out:fade={{ duration: 500, easing: cubicOut }}
    bind:this={modal}
    tabindex="-1"
    class="fixed left-0 top-0 z-50 flex h-screen w-screen items-end justify-center bg-black bg-opacity-30 sm:items-center"
    style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);"
    onclick={clickOutside}
    aria-modal="true"
    role="dialog"
    aria-labelledby={title}
    aria-describedby={description}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class={twMerge(
        "bg-pb-off-white w-full rounded-t-md p-6 sm:w-auto sm:rounded-b-md",
        className,
      )}
      transition:fly={{ easing: cubicInOut, duration: 220, y: "120vw" }}
      onclick={(e) => e.stopPropagation()}
    >
      {@render children()}
    </div>
  </div>
{/if}
