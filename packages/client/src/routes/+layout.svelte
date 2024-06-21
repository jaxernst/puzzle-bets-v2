<script>
  import "../app.css"
  import { mud } from "$lib/mudStore.svelte";
  import { walletStore } from "$lib/walletStore.svelte"
  import { user } from "$lib/userStore.svelte"
  import Puzzly from "$lib/icons/Puzzly.svelte";
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  let { children } = $props()

  $effect(() => {
    if (walletStore.walletClient?.account) {
      mud.setup(walletStore.walletClient);
    }
  });

 

  $effect(() => void user.onWalletChange(walletStore))


  const SIZE_CLOSED = 80
  const SIZE_OPEN = 600

  const size = tweened(SIZE_CLOSED, {
		duration: 300,
		easing: cubicOut
	});

  const toggleExpand = () => {
    console.log("Expand")
    if ($size === SIZE_CLOSED) {
      $size = SIZE_OPEN
    } else {
      $size = SIZE_CLOSED
    }
  }

  

</script>

<div   class="fixed overflow-none h-screen w-screen bg-yellow-400 flex flex-col justify-between">
  <div>
    
  </div>
  
  <div class="flex flex-grow justify-center items-center">
    {@render children()}
  </div>
  
  {#if user.address}

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onclick={toggleExpand} class="flex gap-2 bg-slate-300 p-4 font-bold" style={`height: ${$size}px;`}>
    <Puzzly class="w-8 h-8" />
    Dashboard 

    <div class="flex-grow flex justify-end"><AnimatedArrow class="w-6 h-6 font-bold" direction="up"/></div>
  </div>
  {/if}
</div>