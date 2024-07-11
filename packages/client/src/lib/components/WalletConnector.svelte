<script context="module" lang="ts">
  import { walletStore } from "$lib/walletStore.svelte"
  import { shortenAddress } from "$lib/util"
  import Modal from "./Modal.svelte"
  import type { Wallet } from "$lib/mud/setupNetwork"
  import WalletIcon from "$lib/icons/Wallet.svelte"
  import HandUp from "$lib/assets/HandUp.svelte"

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

<Modal bind:show={showModal} title="" class="p-0 sm:w-[375px]">
  <div class="flex flex-col gap-6 px-4 pt-4">
    <div
      class="flex items-center justify-between gap-2 self-start pr-4 text-base font-bold"
    >
      <div class="flex items-center gap-2 text-sm">
        <WalletIcon class="h-6 w-6 stroke-white" />

        {#if walletStore.address}
          Welcome {shortenAddress(walletStore?.address ?? "")}
        {:else}
          Wallet Sign In
        {/if}
      </div>
    </div>

    <div class="flex flex-col gap-4 text-sm">
      <div style={"font-weight: 900"}>We're in Beta</div>
      <div>Basically it's all “play money” and not real until launch.</div>

      <div>
        Connecting and playing games will NOT use your real ETH. We will give
        you a temporary wallet auto-funded with testnet Ethereum.
      </div>
    </div>

    <button
      class="w-full rounded-md bg-black px-3 py-2 text-center font-bold text-white"
      onclick={() => {
        walletStore.connect()
        showModal = false
      }}
    >
      Connect
    </button>

    <HandUp />
  </div>
</Modal>
