<script lang="ts">
  import { mud } from "$lib/mudStore.svelte"
  import { walletStore } from "$lib/walletStore.svelte"
  import { user } from "$lib/userStore.svelte"
</script>

<div class="flex gap-4">
  <a href="/me" class="border-white bg-black p-2 text-white">
    Connect and Play
  </a>
  <a href="/game/select" class="border-black bg-white p-2">
    Play a Practice Game
  </a>
</div>
