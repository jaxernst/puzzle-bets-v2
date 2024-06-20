<script context="module" lang="ts">
  import { writable } from "svelte/store"
  const showConfirmCode = writable(false)
  const emailInput = writable("")
  const emailError = writable<string | null>(null)
</script>

<script lang="ts">
  import Apple from "$lib/icons/Apple.svelte"
  import Google from "$lib/icons/Google.svelte"
  import { walletStore } from "$lib/walletStore"
  import AnimatedArrow from "../AnimatedArrow.svelte"
  import ConfirmationCodeInput from "./ConfirmationCodeInput.svelte"
  import ButtonPrimary from "../ButtonPrimary.svelte"
  import { preAuthenticate } from "thirdweb/wallets/embedded"
  import { tw } from "$lib/thirdweb"

  export let onConnect: () => void = () => {}

  async function connectWallet(authMethod: "google" | "apple") {
    const wallet = await walletStore.tryConnect(authMethod)
    if (wallet) onConnect()
  }

  async function startEmailVerification() {
    if (!$emailInput.length) {
      $emailError = "Please enter a valid email"
      return
    }

    $emailError = null

    try {
      await preAuthenticate({
        client: tw,
        strategy: "email",
        email: $emailInput,
      })
    } catch (e) {
      console.log(e)

      if (JSON.stringify(e?.toString?.() || "{}").includes("Invalid email")) {
        $emailError = "Email not valid"
      } else {
        $emailError = "An unknown error occured. Please try again later"
      }
      return
    }

    showConfirmCode.set(true)
  }

  async function connectWithEmailCode(code: string) {
    $emailError = null

    try {
      await walletStore.tryConnect("email", {
        email: $emailInput,
        verificationCode: code,
      })

      onConnect()
    } catch (e) {
      console.log("set email error")
      $emailError = "Verification code not valid"
      return
    }
  }
</script>

<div class="flex flex-col items-center gap-4">
  <div class="flex w-full items-center justify-center gap-6">
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

  <div class="flex w-2/3 items-center justify-center gap-1 text-neutral-400">
    <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
    <div class="text-xs">or</div>
    <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
  </div>

  {#if $showConfirmCode && $emailInput}
    <div class="flex flex-col gap-2">
      <div class="text-center text-sm text-neutral-400">
        Enter the verification code sent to
        <div class="text-neutral-200">{$emailInput}</div>
      </div>
      <ConfirmationCodeInput length="6" onComplete={connectWithEmailCode} />
    </div>
  {:else}
    <form
      class="mx-5 flex items-center gap-2 rounded-lg border border-neutral-500"
      on:submit={startEmailVerification}
    >
      <div class="flex-grow">
        <input
          type="text"
          class="w-full border-none bg-transparent px-4 py-2 outline-none"
          placeholder="Enter email address"
          bind:value={$emailInput}
        />
      </div>

      <div class="translate-y-[.065rem] px-1.5">
        <ButtonPrimary
          class="rounded-md border-lime-500 bg-lime-500 px-1 py-1 text-center font-semibold text-white"
        >
          <AnimatedArrow
            direction="right"
            class="h-5 w-5 fill-white stroke-white"
          />
        </ButtonPrimary>
      </div>
    </form>
  {/if}

  {#if $emailError}
    <div class="text-sm text-red-600">
      {$emailError}
    </div>
  {/if}
</div>
