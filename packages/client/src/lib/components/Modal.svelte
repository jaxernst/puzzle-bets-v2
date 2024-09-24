<script lang="ts">
  import { browser } from "$app/environment"
  import { onMount, type Snippet } from "svelte"
  import { cubicInOut, cubicOut } from "svelte/easing"
  import { fade, fly } from "svelte/transition"
  import { twMerge } from "tailwind-merge"
  import AnimatedArrow from "./AnimatedArrow.svelte"
  import HandUp from "$lib/assets/HandUp.svelte"

  let {
    show = $bindable(),
    header,
    description,
    children,
    class: className,
    stopPropagation = true,
    onClose = () => {},
  } = $props<{
    show: boolean
    header: Snippet
    description?: string
    children: any
    stopPropagation?: boolean
    class?: string
    onClose?: () => void
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
      onClose()
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
  const initThemeColor = "rgb(255, 200, 0)"
  $effect(() => {
    if (show) {
      browser && setThemeColor("rgb(178.5, 140, 0)")
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
    class="fixed left-0 top-0 z-50 flex h-svh w-screen items-end justify-center bg-black bg-opacity-30 sm:items-center"
    style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);"
    onclick={(e) => {
      clickOutside(e)
      stopPropagation && e.stopPropagation()
    }}
    aria-modal="true"
    role="dialog"
    aria-describedby={description}
  >
    <div
      class={twMerge(
        "bg-pb-off-white flex max-h-full w-full flex-col gap-6 overflow-y-auto rounded-t-md px-4 pt-4 sm:max-w-[500px] sm:rounded-b-md",
        className,
      )}
      transition:fly={{ easing: cubicInOut, duration: 220, y: "120vw" }}
    >
      <div class="flex items-center justify-between text-sm font-black">
        {@render header()}
        <button
          onclick={() => {
            show = false
            onClose()
          }}
        >
          <AnimatedArrow
            class="h-[22px] w-[24px] stroke-2"
            direction={show ? "down" : "up"}
          />
        </button>
      </div>

      {@render children()}

      <div class="flex flex-grow items-end">
        <HandUp />
      </div>
    </div>
  </div>
{/if}
