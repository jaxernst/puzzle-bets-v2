<script module lang="ts">
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import Clock from "$lib/icons/Clock.svelte"
  import Lock from "$lib/icons/Lock.svelte"
  import Smiley from "$lib/icons/Smiley.svelte"
  import Stars from "$lib/icons/Stars.svelte"
  import Wallet from "$lib/icons/Wallet.svelte"
  import Modal from "$lib/components/Modal.svelte"
  import Link from "$lib/icons/Link.svelte"

  import { goto } from "$app/navigation"
  import { prices } from "$lib/prices.svelte"
  import { mud } from "$lib/mudStore.svelte"
  import type { PuzzleType } from "$lib/types"
  import { capitalized, entityToInt, formatSigFig, formatTime } from "$lib/util"
  import { openControls } from "$lib/components/game-controller/GameController.svelte"
  import { HasValue, runQuery } from "@latticexyz/recs"
  import { user } from "$lib/userStore.svelte"
  import { gameInviteUrls } from "$lib/inviteUrls"
  import { type Entity } from "@latticexyz/recs"
  import { twMerge } from "tailwind-merge"
  let showCreate = $state(false)
  let showConfirm = $state(false)
  let showCreated = $state(false)

  export const toggleNewGameModal = () => {
    showCreate = !showCreate
  }
</script>

<script lang="ts">
  // Public games will always set to the default expiration
  const DEFAULT_EXPIRATION_MINUTES = 60 * 24 * 7

  let puzzleType: PuzzleType = $state("wordle")
  let visibility: "public" | "private" = $state("public")
  let currencyInput = $state("2.00")
  let selectedCurrency = $state<"USD" | "ETH">("USD")
  let inputTimeLimit = $state(8)
  let inviteExpirationMin = $state(DEFAULT_EXPIRATION_MINUTES)

  let selectedCurrencySymbol = $derived(
    { USD: "$", ETH: "Ξ" }[selectedCurrency],
  )

  let otherCurrency = $derived(selectedCurrency === "ETH" ? "USD" : "ETH")
  let otherCurrencyValue = $derived(
    otherCurrency === "ETH"
      ? formatSigFig(Number(currencyInput) / prices.eth, 4)
      : (prices.eth * Number(currencyInput)).toFixed(2),
  )

  const toggleCurrency = (currentCurrency: string) => {
    if (currentCurrency === "USD") {
      // Convert to eth
      selectedCurrency = "ETH"
      currencyInput = String(
        formatSigFig(Number(currencyInput) / prices.eth, 4),
      )
    } else {
      // Convert to USD
      selectedCurrency = "USD"
      currencyInput = (prices.eth * Number(currencyInput)).toFixed(2)
    }
  }

  let createGameLoading = $state(false)
  let createdGameId: Entity | undefined = $derived.by(() => {
    if (!showCreated || !mud.components) return

    const entities = runQuery([
      HasValue(mud.components.Player1, { value: user.address }),
    ])

    const sorted: Entity[] = Array.from(entities).sort(
      (a, b) => parseInt(a, 16) - parseInt(b, 16),
    )

    return sorted[sorted.length - 1]
  })

  let gamePassword: string | undefined = undefined

  $effect(() => {
    if (createdGameId) {
      gameInviteUrls.create({
        puzzleType,
        gameId: Number(entityToInt(createdGameId)),
        inviteName: user.displayName,
        gameWagerUsd: Number(
          selectedCurrency === "USD" ? currencyInput : otherCurrencyValue,
        ),
        password: gamePassword,
      })
    }
  })

  const createGame = async () => {
    let wagerEth = 0
    if (selectedCurrency === "ETH") {
      wagerEth = Number(currencyInput)
    } else {
      wagerEth = Number(currencyInput) / prices.eth
    }

    const _inviteExpirationMin =
      visibility === "public" ? DEFAULT_EXPIRATION_MINUTES : inviteExpirationMin

    gamePassword =
      visibility === "public"
        ? undefined
        : Math.random().toString(36).substring(2)

    createGameLoading = true

    const success = await mud.systemCalls?.newGame(
      puzzleType,
      wagerEth,
      inputTimeLimit,
      _inviteExpirationMin,
      gamePassword,
    )

    if (success) {
      showConfirm = false
      showCreated = true
    }

    createGameLoading = false
  }

  let showInviteCopied = $state(false)

  const copyInviteLink = () => {
    gameInviteUrls.copyForGame(Number(entityToInt(createdGameId)))
    showInviteCopied = true
    setTimeout(() => {
      showInviteCopied = false
    }, 2000)
  }
</script>

{#snippet SelectButton(
  label: any,
  selected: boolean,
  onclick: () => void,
  className?: string,
)}
  <button
    class={twMerge(
      "rounded-md border-2 border-black p-3 py-2 font-bold",
      className,
      selected ? "bg-black text-white" : "text-black",
    )}
    {onclick}
  >
    {label}
  </button>
{/snippet}

<Modal bind:show={showCreate} class="px-6 pb-0 pt-6 sm:w-[450px]">
  {#snippet header()}
    <div class="flex items-center gap-2">
      <Stars />
      Create Game
    </div>
  {/snippet}

  <div class="flex flex-col gap-4">
    <div class="font-extrabold">New {capitalized(puzzleType)} Game</div>

    <!-- Game Visibility -->
    <div class="flex flex-col gap-2">
      <div class="text-[12px]">Choose Game Visibility</div>

      <div class="flex h-[62px] items-stretch text-[13px] font-extrabold">
        <button
          class={`flex w-full flex-col items-center gap-1 rounded-l-lg border-2 border-r-0 border-black px-4 py-2 transition-colors ${
            visibility === "public" ? "bg-black text-white" : ""
          }`}
          onclick={() => {
            visibility = "public"
            inviteExpirationMin = DEFAULT_EXPIRATION_MINUTES
          }}
        >
          <Smiley class={visibility === "public" ? "invert" : ""} />
          <div>Public Game</div>
        </button>

        <button
          class={`flex w-full flex-col items-center gap-1 rounded-r-lg border-2 border-l-0 border-black px-4 py-2 transition-colors ${
            visibility === "private" ? "bg-black text-white" : ""
          }`}
          onclick={() => (visibility = "private")}
        >
          <Lock class={visibility === "private" ? "" : "invert"} />
          <div>Private Game</div>
        </button>
      </div>

      <div class="text-xs text-black/50">
        {#if visibility === "public"}
          Anyone can join your game from the lobby
        {:else if visibility === "private"}
          Only people with your invite link can join
        {/if}
      </div>
    </div>

    <!-- Game Name -->
    <!-- <div class="">
      <div class="mb-2 text-[11px]">
        Game Name <span class="font-bold">(optional)</span>
      </div>

      <div
        class="flex w-full items-center rounded-md bg-[#E7E1D2] pl-3 font-bold"
      >
        Wordle
        <div class="ml-2">|</div>
        <input
          class="flex-grow bg-transparent px-2 py-3"
          placeholder="Game Name"
          bind:value={gameName}
        />
      </div>
    </div> -->

    <!-- Game Wager -->
    <div>
      <div class="mb-2 text-[12px]">Wager</div>

      <div class="mb-1.5 flex gap-2">
        {#each { USD: [1, 2, 5, 20], ETH: [0.001, 0.01, 0.05, 0.2] }[selectedCurrency] as wager}
          {@render SelectButton(
            `${selectedCurrencySymbol}${wager}`,
            Number(currencyInput) === wager,
            () => (currencyInput = String(wager)),
            "text-sm",
          )}
        {/each}
      </div>

      <div class="flex gap-2">
        <div
          class="flex w-full items-center rounded-md bg-[#E7E1D2] pl-3 font-bold"
        >
          {selectedCurrencySymbol}
          <div class="ml-2">|</div>
          <input
            class="flex-grow bg-transparent px-2 py-3"
            placeholder="Game Name"
            type="number"
            step={selectedCurrency === "USD" ? "1" : ".001"}
            min="0"
            bind:value={currencyInput}
          />
        </div>

        <button
          class="flex items-center gap-1 whitespace-nowrap rounded-md border-2 border-black p-3 font-bold"
          onclick={() => toggleCurrency(selectedCurrency)}
        >
          {selectedCurrency} ({selectedCurrencySymbol})

          <AnimatedArrow
            direction={selectedCurrency === "USD" ? "down" : "up"}
            class="h-4 w-4"
          />
        </button>
      </div>

      <div class="mt-2 text-[11px] leading-none text-black/50">
        {otherCurrencyValue}
        {otherCurrency}
      </div>
    </div>

    <!-- Puzzle Time Limit -->
    <div>
      <div class="mb-2 text-[12px]">Puzzle Time Limit</div>

      <div class="flex gap-2">
        {#each [4, 8, 20] as timeLimit}
          {@const isSelected = inputTimeLimit === timeLimit}

          {@render SelectButton(
            `${timeLimit} min`,
            isSelected,
            () => (inputTimeLimit = timeLimit),
          )}
        {/each}
      </div>
    </div>

    <!-- Invite Expiration  -->
    {#if visibility === "private"}
      <div>
        <div class="mb-2 text-[11px]">Invite Expires</div>

        <div class="flex gap-2">
          {#each [[60, "1 hour"], [60 * 6, "6 hours"], [60 * 24, "1 day"], [60 * 24 * 7, "1 week"]] as [expTime, label]}
            {@const isSelected = inviteExpirationMin === expTime}

            {@render SelectButton(
              label,
              isSelected,
              () => (inviteExpirationMin = Number(expTime)),
            )}
          {/each}
        </div>
      </div>
    {/if}

    <hr class="my-2" />

    <div class="flex w-full flex-col gap-2 font-bold">
      <button
        onclick={() => {
          showCreate = false
          showConfirm = true
        }}
        class="rounded-md border-2 border-black bg-black py-2 text-white"
      >
        Create Game
      </button>

      <button
        class="rounded-md border-2 border-black py-2"
        onclick={(e) => {
          e.stopPropagation()
          toggleNewGameModal()
        }}
      >
        Cancel
      </button>

      <div class="text-center text-[12px] font-normal leading-tight">
        A 2.5% procotol fee will be applied to the winner's payout
      </div>
    </div>
  </div>
</Modal>

<Modal bind:show={showConfirm} class="px-6 pb-0 pt-6 sm:w-[450px]">
  {#snippet header()}
    <div class="flex items-center gap-2 text-sm font-extrabold">
      <Stars />
      Confirm Create Game
    </div>
  {/snippet}

  <div class="flex flex-col gap-6">
    <div class="font-extrabold">New {capitalized(puzzleType)} Game</div>

    <div class="flex flex-grow gap-6">
      <div class="flex flex-col gap-2">
        <div class="text-sm">Visibility</div>
        <div
          class="bg-pb-gray-1 flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-bold"
        >
          <Smiley class="h-[18px] w-[18px]" />
          {capitalized(visibility)} Game
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="text-sm">Wager</div>
        <div
          class="bg-pb-gray-1 flex items-center gap-1 rounded-full px-2 py-1 text-[13px]"
        >
          <Wallet class="h-[18px] w-[18px]" />
          <span class="font-bold">{selectedCurrencySymbol}{currencyInput}</span>
          /
          <span>{otherCurrencyValue} {otherCurrency}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-6">
      <div class="flex flex-col gap-2">
        <div class="text-sm">Puzzle Time Limit</div>
        <div
          class="bg-pb-gray-1 flex items-center gap-1 self-start rounded-full px-2 py-1 text-[13px]"
        >
          <Clock class="h-[18px] w-[18px]" />
          <span class="font-bold">{inputTimeLimit} min</span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="text-sm">Invite Expiration</div>
        <div
          class="bg-pb-gray-1 flex items-center gap-1 self-start rounded-full px-2 py-1 text-[13px]"
        >
          <Clock class="h-[18px] w-[18px]" />
          <span class="font-bold">{formatTime(inviteExpirationMin * 60)}</span>
        </div>
      </div>
    </div>

    <hr class="my-1" />

    <div class="flex w-full flex-col gap-2 font-bold">
      <button
        onclick={createGame}
        class="flex justify-center rounded-md border-2 border-black bg-black py-2 text-white"
      >
        {#if !createGameLoading}
          Confirm
        {:else}
          <DotLoader class="fill-white" />
        {/if}
      </button>

      <button
        class="rounded-md border-2 border-black py-2"
        onclick={() => {
          showConfirm = false
          showCreate = true
        }}
      >
        Edit Details
      </button>

      <div
        class="max-w-[340px] self-center text-center text-[12px] font-normal leading-tight"
      >
        This action will deposit your wager in the smart contract. You may
        cancel and withdraw up until your opponent joins.
      </div>
    </div>
  </div>
</Modal>

<Modal
  bind:show={showCreated}
  class="px-6 pb-0 pt-6 sm:w-[450px]"
  stopPropagation={true}
>
  {#snippet header()}
    <div class="flex items-center gap-2 text-sm font-extrabold">
      <Stars />
      Success
    </div>
  {/snippet}

  <div class="flex flex-col gap-5">
    <div>
      <div class="mb-3 font-extrabold">Game Created!</div>

      <div class="leading-tight">
        Your wager has been deposited into the smart contract and your game has
        been created.
      </div>
    </div>

    <div>
      <div class="mb-3 font-extrabold">What now?</div>

      <div class="mb-3 leading-tight">
        {#if visibility === "public"}
          Wait for an opponent to join your public game or invite a friend with
          your game invite link.
        {:else}
          Copy your game invite link and share with a friend to challenge them.
        {/if}
      </div>

      <div class="leading-tight">
        <span class="underline">
          Once your opponent joins, you'll have 24 hours to start your turn
        </span>
      </div>
    </div>

    <hr class="my-1" />

    {#if createdGameId}
      <div class="text-center font-extrabold">
        {capitalized(puzzleType)} #{entityToInt(createdGameId)}
      </div>

      <div class="flex flex-col gap-2 font-bold">
        <button
          class="flex items-center justify-center gap-2 rounded-md border-2 border-black bg-black py-2 text-white"
          onclick={copyInviteLink}
        >
          {#if showInviteCopied}
            Invite Copied!
          {:else}
            Copy Invite Link
            <Link />
          {/if}
        </button>
        <button
          class="rounded-md border-2 border-black py-2"
          onclick={() => {
            goto(`/game/${puzzleType}/${entityToInt(createdGameId)}`)
            showCreated = false
          }}
        >
          Go To Game Room
        </button>

        <button
          class="rounded-md border-2 border-black py-2"
          onclick={(e) => {
            e.stopPropagation()
            showCreated = false
            openControls("lobby")
          }}
        >
          Back To Lobby
        </button>
      </div>
    {/if}
  </div>
</Modal>
