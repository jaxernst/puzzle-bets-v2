<script context="module" lang="ts">
  import { walletStore } from "$lib/walletStore"
  import { mud } from "$lib/mud/mudStore"
  import { shortenAddress } from "$lib/util"
  import { get, writable } from "svelte/store"
  import Modal from "../Modal.svelte"
  import type { Wallet } from "$lib/mud/setupNetwork"
  import { browser } from "$app/environment"
  import DotLoader from "../DotLoader.svelte"
  import { networkConfig } from "$lib/mud/networkConfig"
  import ButtonPrimary from "../ButtonPrimary.svelte"
  import WalletIcon from "$lib/icons/Wallet.svelte"
  import EmbeddedWalletConnect from "./EmbeddedWalletConnect.svelte"

  const showModal = writable(false)

  export const loginAndConnect = async () => {
    const wallet = await promptConnectWallet()
    await mud.setup(wallet)

    if (wallet.account && networkConfig.connectMode === "burner") {
      fetch(`api/drip`, { method: "POST" })
    }
  }

  export async function promptConnectWallet() {
    showModal.set(true)

    return new Promise<Wallet>(async (resolve, reject) => {
      walletStore.subscribe((wallet) => {
        if (wallet.account) setTimeout(() => resolve(wallet as Wallet), 1000)
      })

      showModal.subscribe((show) => {
        if (!show && !get(walletStore)) {
          reject("No wallet connected")
        }
      })
    })
  }
</script>

<Modal show={$showModal} on:close={() => ($showModal = false)} title="">
  <div
    class="relative z-10 flex min-h-[200px] min-w-[220px] max-w-[360px] flex-col items-center gap-4 rounded-lg bg-neutral-800 p-6 text-neutral-100"
  >
    <div class="flex items-center gap-2 self-start pr-4 text-base font-bold">
      <WalletIcon class="h-5 w-5 stroke-white" />
      {#if $walletStore.account}
        Welcome {shortenAddress($walletStore?.account.address ?? "")}
      {:else}
        Wallet Sign In
      {/if}
    </div>

    <button
      class="absolute right-2 top-0 text-lg text-zinc-400"
      on:click={() => showModal.set(false)}
    >
      x
    </button>

    <div class="flex flex-grow flex-col justify-center gap-4">
      {#if $walletStore.account}
        <div class="flex-grow" />
        <ButtonPrimary
          class="mb-2 mt-3 self-center rounded-full px-3 py-1"
          on:click={walletStore.disconnect}
        >
          Disconnect
        </ButtonPrimary>
      {:else if $walletStore.connecting}
        <DotLoader class="fill-neutral-400" />
      {:else if networkConfig.connectMode === "burner"}
        <div class="border-l border-neutral-400 px-3 text-sm text-neutral-400">
          This is a testnet preview of Puzzle Bets. Click 'Connect' to create a
          temporary wallet auto-funded with testnet Ethereum (ETH).
        </div>

        <ButtonPrimary
          class="mb-2 mt-3 self-center rounded-full px-3 py-1 "
          on:click={() => {
            walletStore.tryConnectBurner()
            showModal.set(false)
          }}
        >
          Connect
        </ButtonPrimary>
      {:else if networkConfig.connectMode === "embedded"}
        <div class="border-l border-neutral-400 pl-3 text-sm text-neutral-300">
          This is a testnet preview of Puzzle Bets. Sign in to create or access
          your testnet wallet auto-funded with testnet Ethereum (eth).
        </div>
        <div class="flex w-full justify-center py-3">
          <div class="max-w-[300px]">
            <EmbeddedWalletConnect onConnect={() => showModal.set(false)} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</Modal>
