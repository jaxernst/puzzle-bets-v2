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

  export const loginAndConnect = async () => {
    const wallet = await promptConnectWallet()
    await mud.setup(wallet)

    if (wallet.account && networkConfig.connectMode === "burner") {
      fetch(`api/drip`, { method: "POST" })
    }
  }

  let resolveWalletConnected = $state<((wallet: Wallet) => any) | null>(null)
  let rejectWalletConnected = $state<((err: string) => void) | null>(null)

  export async function promptConnectWallet() {
    showModal = true

    return new Promise<Wallet>(async (resolve, reject) => {
      resolveWalletConnected = resolve
      rejectWalletConnected = reject
    })
  }
</script>

<script>
  $effect(() => {
    if (walletStore.address && resolveWalletConnected) {
      resolveWalletConnected(walletStore.walletClient as Wallet)
      resolveWalletConnected = null
      rejectWalletConnected = null
    }

    if (!showModal && !walletStore.address && rejectWalletConnected) {
      rejectWalletConnected("No wallet conneted")
      resolveWalletConnected = null
      rejectWalletConnected = null
    }
  })
</script>

<Modal show={showModal} on:close={() => (showModal = false)} title="">
  <div
    class="relative z-10 flex min-h-[200px] min-w-[220px] max-w-[360px] flex-col items-center gap-4 rounded-lg bg-neutral-800 p-6 text-neutral-100"
  >
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
  </div>
</Modal>
