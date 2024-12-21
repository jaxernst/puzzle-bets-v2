<script lang="ts">
  import PuzzleBetsSmall from "$lib/svg-components/PuzzleBetsSmall.svelte"
  import Avatar1 from "$lib/svg-components/Avatar1.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import Edit from "$lib/icons/Edit.svelte"

  import { shortenAddress } from "$lib/util"
  import { page } from "$app/stores"
  import { user } from "$lib/userStore.svelte"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import { walletStore } from "$lib/walletStore.svelte"
  import { toggleDisplayNameModal } from "./modals/DisplayNameModal.svelte"

  let showAccountModal = $state(false)
</script>

<div
  class=" border-b-1 mx-2 flex items-center justify-between border-black/20 py-2 font-bold sm:mx-4"
>
  {#if $page.route.id !== "/"}
    <a href="/" class="">
      <PuzzleBetsSmall />
    </a>

    <div class="">
      {#if user.address}
        <button
          onclick={() => (showAccountModal = true)}
          class="flex items-center gap-2"
        >
          <div class="flex items-center gap-1 px-1 text-sm">
            <Avatar1 />
            {shortenAddress(user.address)}
          </div>

          <div
            class=" bg-pb-beige-1 flex items-center gap-1 rounded-full p-2 text-xs"
          >
            <Wallet />
            {user.balanceUsd}
          </div>
        </button>
      {:else}
        <button
          class="bg-pb-beige-1 flex items-center gap-1 rounded-full p-2 text-sm"
          onclick={promptConnectWallet}
        >
          Connect
        </button>
      {/if}
    </div>
  {/if}
</div>

<Modal bind:show={showAccountModal} class="sm:w-[400px]">
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Wallet />
      Account
    </div>
  {/snippet}

  <div class="flex flex-col">
    <div class="flex gap-3">
      <img
        src="/avatar-1.png"
        class="h-[50px] w-[50px] flex-shrink-0"
        alt="Avatar"
      />

      <div class="flex flex-col gap-3 text-sm">
        {#if user.displayName}
          <div>
            <div class="mb-1 text-sm text-[#3f3f3f]">Your Display Name</div>
            <div class="flex items-center gap-1">
              <div class="font-bold">{user.displayName}</div>
              <button onclick={toggleDisplayNameModal}>
                <Edit class="stroke-black" />
              </button>
            </div>
          </div>
        {:else}
          <button
            onclick={toggleDisplayNameModal}
            class=" bg-pb-yellow flex items-center gap-1 self-start rounded-full px-2 py-1 font-bold"
          >
            <Edit class="stroke-black" />
            <p class="pt-[2px]">Set Display Name</p>
          </button>
        {/if}

        <div>
          <div class="mb-1 text-sm text-[#3f3f3f]">Your Wallet Address</div>
          <div class="font-bold">{user.address}</div>
        </div>
      </div>
    </div>
  </div>

  <hr />

  <div class="flex flex-col gap-2">
    <button
      onclick={() => {
        walletStore.disconnect()
        showAccountModal = false
      }}
      class="rounded border-2 border-black p-3 text-center text-base font-bold"
    >
      Disconnect
    </button>
  </div>
</Modal>
