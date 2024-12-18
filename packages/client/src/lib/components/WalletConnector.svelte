<script context="module" lang="ts">
  import { walletStore } from "$lib/walletStore.svelte"
  import { shortenAddress } from "$lib/util"
  import Modal from "./Modal.svelte"
  import type { Wallet } from "$lib/mud/setupNetwork"
  import WalletIcon from "$lib/icons/Wallet.svelte"
  import { user } from "$lib/userStore.svelte"
  import { mud } from "$lib/mudStore.svelte"

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

<script lang="ts">
  let { autoconnect } = $props<{ autoconnect?: boolean }>()

  const autoConnectWallet = async () => {
    const walletClient = await walletStore.autoConnect()

    if (walletClient) {
      await mud.setup(walletClient)
    }
  }

  const handleConnect = async () => {
    const walletClient = await walletStore.connect()
    if (!walletClient?.account.address) {
      walletConnectFail("No wallet account available")
      return
    }

    mud.setup(walletClient)
  }

  let autoconnectAttempted = false
  $effect(() => {
    if (autoconnect && !walletStore.address && !autoconnectAttempted) {
      autoConnectWallet().finally(() => {
        autoconnectAttempted = true
      })
    }
  })

  $effect(() => {
    if (walletStore.walletClient && user.authenticated) {
      walletConnectSuccess(walletStore.walletClient as Wallet)
      showModal = false
    }
  })

  $effect(() => {
    if (!showModal && user.address && user.address !== user.authenticated) {
      showModal = true
    }
  })
</script>

<Modal bind:show={showModal} class="sm:w-[375px]">
  {#snippet header()}
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
  {/snippet}

  <div class="flex flex-grow flex-col gap-4">
    <div style={"font-weight: 900"}>We're in Beta!</div>
    <div class="text-sm leading-tight">
      Basically it's all “play money” and not real until launch. Connecting and
      playing games will NOT use your real ETH.
    </div>

    <div class="text-sm"></div>
  </div>

  {#if !user.address}
    <button
      class="w-full rounded-md border-2 border-black bg-black px-3 py-2 text-center font-bold text-white"
      onclick={handleConnect}
    >
      Connect
    </button>
  {:else if user.authenticated !== user.address}
    <div class="flex flex-col gap-2">
      <button
        class="w-full rounded-md border-2 border-black bg-black px-3 py-2 text-center font-bold text-white"
        onclick={user.authenticate}
      >
        Sign in
      </button>

      <button
        class="w-full rounded-md border-2 border-black px-3 py-2 text-center font-bold text-black"
        onclick={walletStore.disconnect}
      >
        Disconnect
      </button>
    </div>
  {/if}
</Modal>
