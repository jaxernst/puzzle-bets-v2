<script context="module" lang="ts">
  import { walletStore } from "$lib/walletStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { shortenAddress } from "$lib/util"
  import Modal from "./Modal.svelte"
  import type { Wallet } from "$lib/mud/setupNetwork"
  import DotLoader from "./DotLoader.svelte"
  import { networkConfig } from "$lib/mud/networkConfig"
  import WalletIcon from "$lib/icons/Wallet.svelte"

  let showModal = $state(false)

  let walletConnectSuccess = $state<(wallet: Wallet) => any>(() => {})
  let walletConnectFail = $state<(err: string) => void>(() => {})

  export async function promptConnectWallet() {
    showModal = true

    return new Promise((resolve, reject) => {
      walletConnectSuccess = resolve
      walletConnectFail = reject
    })
  }
</script>

<script>
  let showModalPrev = false
  $effect(() => {
    const wasClosed = !showModal && showModalPrev

    if (wasClosed && walletStore.address) {
      console.log("Wallet connect success")
      walletConnectSuccess(walletStore.walletClient as Wallet)
    }

    if (wasClosed && !walletStore.address) {
      console.log("Wallet connect failed")
      walletConnectFail("No wallet connected")
    }

    showModalPrev = showModal
  })
</script>

<Modal bind:show={showModal} title="">
  <div class="flex items-center gap-2 self-start pr-4 text-base font-bold">
    <WalletIcon class="h-5 w-5 stroke-white" />
    {#if walletStore.address}
      Welcome {shortenAddress(walletStore?.address ?? "")}
    {:else}
      Wallet Sign In
    {/if}
  </div>

  <button
    class="absolute right-2 top-0 text-lg text-zinc-400"
    onclick={() => (showModal = false)}
  >
    x
  </button>

  <div class="flex flex-grow flex-col justify-center gap-4">
    {#if walletStore.address}
      <div class="flex-grow"></div>

      <button
        class="mb-2 mt-3 self-center rounded-full bg-black px-3 py-1 text-white"
        onclick={walletStore.disconnect}
      >
        Disconnect
      </button>
    {:else if walletStore.connecting}
      <DotLoader class="fill-neutral-400" />
    {:else if networkConfig.connectMode === "burner"}
      <div class="border-l border-neutral-400 px-3 text-sm text-neutral-400">
        This is a testnet preview of Puzzle Bets. Click 'Connect' to create a
        temporary wallet auto-funded with testnet Ethereum (ETH).
      </div>

      <button
        class="mb-2 mt-3 self-center rounded-full bg-black px-3 py-1 text-white"
        onclick={() => {
          walletStore.connect()
          showModal = false
        }}
      >
        Connect
      </button>
    {:else if networkConfig.connectMode === "embedded"}
      <div class="border-l border-neutral-400 pl-3 text-sm text-neutral-300">
        This is a testnet preview of Puzzle Bets. Sign in to create or access
        your testnet wallet auto-funded with testnet Ethereum (eth).
      </div>
      <div class="flex w-full justify-center py-3">
        <div class="max-w-[300px]">
          Not in use
          <!-- <EmbeddedWalletConnect onConnect={() => (showModal = false)} /> -->
        </div>
      </div>
    {/if}
  </div>
</Modal>
