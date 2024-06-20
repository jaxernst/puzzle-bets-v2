<script lang="ts">
  import { browser } from "$app/environment"
  import Apple from "$lib/icons/Apple.svelte"
  import Google from "$lib/icons/Google.svelte"
  import { walletStore } from "$lib/mud/connectWallet"
  import { mud } from "$lib/mud/mudStore"
  import { networkConfig } from "$lib/mud/networkConfig"

  export let onConnect: () => void = () => {}

  const connectWallet = async (authMethod: "google" | "apple" | "email") => {
    const wallet = await walletStore.tryConnect(authMethod)
    if (wallet) onConnect()
  }

  if (browser && networkConfig.connectMode === "embedded") {
    walletStore.tryConnect("auto").then((w) => {
      mud.setup(w)
    })
  }
</script>

<div class="flex w-full items-center justify-evenly">
  <button
    on:click={() => connectWallet("google")}
    class="flex items-center gap-2 rounded-lg border border-neutral-500 p-3 text-sm text-neutral-400 transition-colors hover:bg-lime-500"
  >
    <div class="h-7 w-7">
      <Google />
    </div>
  </button>

  <button
    on:click={() => connectWallet("apple")}
    class="txt-sm flex items-center gap-2 rounded-lg border border-neutral-500 p-3 text-neutral-400 transition-colors hover:bg-lime-500"
  >
    <div class="h-7 w-7">
      <Apple />
    </div>
  </button>
</div>

<div class="flex w-full items-center justify-center gap-1 text-neutral-400">
  <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
  <div class="text-xs">or</div>
  <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
</div>

<input
  type="text"
  class="w-full rounded-lg border border-neutral-500 bg-transparent px-4 py-2"
  placeholder="Enter email address"
/>

<button
  class="w-full rounded-lg border border-lime-500 bg-lime-500 py-2 text-center font-semibold text-white"
>
  Continue
</button>
