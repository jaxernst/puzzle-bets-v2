<script context="module">
  import Modal from "$lib/components/Modal.svelte"
  import Stars from "$lib/icons/Stars.svelte"

  let show = $state()

  export const openNewGameModal = () => {
    show = true
  }
</script>

<Modal bind:show>
  <div class="flex gap-2 font-extrabold">
    <Stars />
    Create Game
  </div>
</Modal>
