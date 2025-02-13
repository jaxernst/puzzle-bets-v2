<script module lang="ts">
  import Modal from "./Modal.svelte"
  import WalletIcon from "$lib/icons/Wallet.svelte"
  import DotLoader from "./DotLoader.svelte"

  import { walletStore } from "$lib/walletStore.svelte"
  import { shortenAddress } from "$lib/util"
  import type { Wallet } from "$lib/mud/setupNetwork"
  import { user } from "$lib/userStore.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import { toastError } from "$lib/toast"
  import { frameStore } from "$lib/farcaster/frameStore.svelte"
  import { networkConfig } from "$lib/mud/networkConfig"

  let showModal = $state(false)

  let walletConnectSuccess = $state<(wallet: Wallet) => any>(() => {})
  let walletConnectFail = $state<(err: string) => void>(() => {}) // Not used currently

  let disclaimerAcknowledged = $state(false)

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

  let setupCalled = false

  const autoConnectWallet = async () => {
    const walletClient = await walletStore.autoConnect()
    if (walletClient && !setupCalled) {
      setupCalled = true
      console.log("[autoconnect] setup mud")
      await mud.setup(walletClient)
    }
  }

  const handleConnect = async () => {
    let walletClient: Wallet | undefined
    try {
      walletClient = await walletStore.connect()
    } catch (e: any) {
      toastError(`Connect failed: ${e.message ?? "Unknown error"}`)
      return
    }

    if (walletClient && !setupCalled) {
      setupCalled = true
      console.log("[manual connect] setup mud")
      await mud.setup(walletClient)
    }
  }

  // Autoconnect
  let autoconnectAttempted = false
  $effect(() => {
    const triedFrameStoreInit = frameStore.initialized || frameStore.unavailable
    const shouldAutoconnect = autoconnect && !autoconnectAttempted

    if (user.authenticated && shouldAutoconnect && triedFrameStoreInit) {
      autoConnectWallet().finally(() => {
        autoconnectAttempted = true
      })
    }
  })

  // Auto close once authenticated
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

  // The siwe prompt should be shown automatically, but it can be triggered manually in case of an issue
  const manualSignIn = async () => {
    try {
      await user.authenticate()
    } catch (e) {
      toastError(
        "Failed to sign in with your wallet. Disconnect and try again.",
      )
    }
  }
</script>

{#snippet testnetDisclaimer()}
  <div class="flex flex-grow flex-col gap-4">
    <div style={"font-weight: 900"}>We're in Beta!</div>
    <div class="text-sm leading-tight">
      Basically it's all "play money" and not real until launch. Connecting and
      playing games will NOT use your real ETH.
    </div>

    <div class="text-sm"></div>
  </div>
{/snippet}

{#snippet mainnetDisclaimer()}
  <div class="flex flex-grow flex-col gap-4">
    <div style={"font-weight: 900"}>Connect to play live wagers on Base!</div>
    <div
      class="space-y-2 rounded border border-black p-1.5 text-sm leading-tight"
    >
      <p class="underline">Important Disclaimers:</p>
      <div class="space-y-1">
        <p>
          <i
            >• This is an experimental interface for smart contracts that are
            not known to have been audited.</i
          >
        </p>
        <p>
          <i
            >• Funds wagered in timed games are at risk of loss from network
            issues, interface errors, or smart contract bugs.</i
          >
        </p>
        <p><i>• Use at your own risk.</i></p>
      </div>
    </div>

    <label class="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        bind:checked={disclaimerAcknowledged}
        class="mt-.5"
      />
      <span>I have read the disclaimers and accept these risks.</span>
    </label>
  </div>
{/snippet}

<Modal bind:show={showModal} class="sm:w-[375px]">
  {#snippet header()}
    <div
      class="flex items-center justify-between gap-2 self-start pr-4 text-base font-bold"
    >
      <div class="flex items-center gap-2 text-sm">
        <WalletIcon class="h-6 w-6 stroke-white" />

        {#if user.address}
          Welcome {shortenAddress(user.address)}
        {:else}
          Wallet Sign In
        {/if}
      </div>
    </div>
  {/snippet}

  {#if networkConfig.chain.testnet}
    {@render testnetDisclaimer()}
  {:else}
    {@render mainnetDisclaimer()}
  {/if}

  {#if !user.address}
    <button
      class="flex w-full justify-center gap-3 rounded-md border-2 border-black bg-black px-3 py-2 text-center font-bold text-white"
      onclick={handleConnect}
      disabled={networkConfig.chain.testnet ? false : !disclaimerAcknowledged}
      class:opacity-50={networkConfig.chain.testnet
        ? false
        : !disclaimerAcknowledged}
    >
      {#if walletStore.connecting}
        Connecting
        <DotLoader class="self-center fill-white" />
      {:else}
        Connect Wallet
      {/if}
    </button>
  {:else if user.authenticated !== user.address}
    <div class="flex flex-col gap-2">
      <button
        class="flex w-full justify-center gap-3 rounded-md border-2 border-black bg-black px-3 py-2 text-center font-bold text-white"
        onclick={manualSignIn}
      >
        {#if user.authenticating}
          Signing in
          <DotLoader class="self-center fill-white" />
        {:else}
          Sign in with your wallet
        {/if}
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
