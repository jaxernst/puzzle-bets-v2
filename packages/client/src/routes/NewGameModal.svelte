<script context="module">
  import Modal from "$lib/components/Modal.svelte"

  let show = $state()

  export const openNewGameModal = () => {
    show = true
  }
</script>

<Modal bind:show>Wip</Modal>
