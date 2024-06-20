<script lang="ts">
  import { browser } from "$app/environment"
  import { goto } from "$app/navigation"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { gameInviteUrls } from "$lib/inviteUrls"
  import { mud } from "$lib/mud/mudStore"
  import { user } from "$lib/userStore"
  import { HasValue, runQuery } from "@latticexyz/recs"
  import { cubicOut } from "svelte/easing"
  import { slide } from "svelte/transition"
  import { notifications } from "$lib/notifications/notificationStore"
  import NotificationBell from "$lib/icons/NotificationBell.svelte"
  import { newGame } from "./newGame"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import ButtonPrimary from "$lib/components/ButtonPrimary.svelte"
  import ButtonSecondary from "$lib/components/ButtonSecondary.svelte"
  import { formatAsDollar, formatSigFig } from "$lib/util"
  import { ethPrice } from "$lib/ethPrice"

  export let onCancel = () => {}
  // export let onCreate = () => {}

  let gameCreated = false
  $: createGameError = $newGame.error
  $: createGameLoading = $newGame.loading
  $: puzzleType = $newGame.puzzleType

  // Query mud components to check for most recent gameId
  let createdGameId: number | null = null
  $: if (browser && gameCreated && $mud.components) {
    const entities = runQuery([
      HasValue($mud.components.Player1, { value: $user.address }),
    ])

    const sorted = Array.from(entities).sort(
      (a, b) => parseInt(a, 16) - parseInt(b, 16),
    )

    const newest = sorted[sorted.length - 1]

    if (newest) {
      createdGameId = parseInt(newest, 16)
      gameInviteUrls.create({
        puzzleType,
        gameId: createdGameId,
        inviteName: $newGame.inviteName,
        gameWagerUsd: $newGame.wagerEth * $ethPrice,
        password: $newGame.password,
      })
    }
  }

  const create = async () => {
    await newGame.create()
    gameCreated = true
  }

  // Go to the game page once created (doesn't close modal)
  $: if (createdGameId) {
    goto(`/games/${puzzleType}/${createdGameId}`)
  }

  let inviteCopied = false
  async function copyInviteUrl() {
    const inviteUrl =
      typeof createdGameId === "number" && $gameInviteUrls[createdGameId]
    if (!inviteUrl) throw new Error("No invite url")

    try {
      await navigator.clipboard.writeText(inviteUrl)
      inviteCopied = true
      setTimeout(() => (inviteCopied = false), 1800)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }
</script>

<div class="py-4">
  <div
    class="grid grid-cols-[1fr_auto] gap-1 rounded-md bg-neutral-700 p-3 text-sm sm:text-base"
  >
    <div>Game visibility</div>
    <div class="text-neutral-300">
      {$newGame.password ? "Private (Invite Only)" : "Public (In Lobby)"}
    </div>
    <div>Wager</div>
    <div class="text-neutral-300">
      {formatSigFig($newGame.wagerEth, 3)} eth ({formatAsDollar(
        $newGame.wagerEth * $ethPrice,
      )} USD)
    </div>
    <div>Submission Window</div>
    <div class="text-neutral-300">{$newGame.submissionWindow} minutes</div>
    <div>Invite Expires</div>
    <div class="text-neutral-300">{$newGame.inviteExpiration} minutes</div>
  </div>
  <div class="pt-1 text-xs italic text-neutral-500">
    ** A 2.5% protocol fee will be applied the winners' payout
  </div>
</div>

<div class="flex items-center justify-center">
  <!--Hide this once a game has been created or is loading (show if errored)-->
  {#if !createGameLoading && !gameCreated}
    <div class="flex-grow">
      <ButtonSecondary on:click={onCancel}>
        <AnimatedArrow direction="left" class="w-5 fill-lime-500" />
      </ButtonSecondary>
    </div>
  {/if}

  {#key [createGameLoading, gameCreated, inviteCopied]}
    <div in:slide={{ axis: "x", easing: cubicOut }}>
      <ButtonPrimary
        on:click={() => (!gameCreated ? create() : copyInviteUrl())}
      >
        {#if createGameLoading}
          <DotLoader />
        {:else if inviteCopied}
          Invite Copied!
        {:else if gameCreated}
          <div>Success! Click to copy invite link</div>
        {:else}
          Create Game ({formatAsDollar($newGame.wagerEth * $ethPrice)})
        {/if}
      </ButtonPrimary>
    </div>
  {/key}
</div>

{#if createGameError}
  <div class="text-sm text-red-500">{createGameError}</div>
{/if}

{#if createdGameId}
  <div class="w-full text-center text-lime-500">
    Game Id: {createdGameId}
  </div>
{/if}

{#if gameCreated && !$notifications.enabled}
  <div
    class="flex items-center gap-2 self-center whitespace-nowrap fill-neutral-400 text-xs text-neutral-400 sm:text-base"
  >
    Click the
    <div class="h-4 w-4"><NotificationBell /></div>
    to get notified when your opponent joins
  </div>
{/if}
