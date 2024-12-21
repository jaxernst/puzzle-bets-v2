<script lang="ts">
  import SignInToJoinModal from "$lib/components/modals/SignInToJoinModal.svelte"
  import JoinGameModal from "$lib/components/modals/JoinGameModal.svelte"

  import { user } from "$lib/userStore.svelte"

  let { children } = $props()

  let showJoin = $state(false)
  let showSignInToJoin = $state(false)

  $effect(() => {
    if (user.address) {
      showJoin = true
      showSignInToJoin = false
    } else {
      showJoin = false
      showSignInToJoin = true
    }
  })
</script>

<SignInToJoinModal show={showSignInToJoin} />
<JoinGameModal show={showJoin} />

{@render children()}
