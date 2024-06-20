<script lang="ts">
  import { shortenAddress } from "$lib/util"
  export let address: string

  let copied = false
  async function copyInviteUrl() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(address)
      copied = true
      setTimeout(() => (copied = false), 1800)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }
</script>

<div class="group relative p-1 sm:p-2">
  <div class="group-hover:opacity-40">{shortenAddress(address)}</div>
  <button
    on:click={copyInviteUrl}
    class="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-xl bg-neutral-800 bg-opacity-60 font-normal text-white opacity-0 transition-all duration-200 group-hover:opacity-100"
  >
    {copied ? "Copied!" : "Copy"}
  </button>
</div>
