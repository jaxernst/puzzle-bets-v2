<script lang="js">
  export let length
  export let onComplete = (_) => {}
  let els = []
  let values = []
  let code = null

  $: {
    ;(() => {
      if (values.length != length || values.includes(null)) {
        code = null
        return
      }
      code = 0

      values.forEach((value, index) => {
        code += value * 10 ** (length - index - 1)
      })
      code = code.toString().padStart(length, "0")
      onComplete(code)
    })()
  }

  function handleMoveAndBackspace(e) {
    let targetIndex = +e.target.getAttribute("index")

    switch (e.key) {
      case "ArrowRight": //ArrowRight
        e.preventDefault()
        els[min(length - 1, targetIndex + 1)].focus()
        break
      case "ArrowLeft": //ArrowLeft
        e.preventDefault()
        els[max(0, targetIndex - 1)].focus()
        break
      case "Backspace": //Backspace
        e.preventDefault()

        // if curent cell is empty we want to backspace the previous cell
        if (!values[targetIndex] && values[targetIndex] != 0) {
          els[max(0, targetIndex - 1)].focus()
          values[targetIndex - 1] = null
        } else {
          values[targetIndex] = null
        }
        break
    }
  }

  function handleKey(e) {
    if (Number.isNaN(+e.key)) return
    values[e.target.getAttribute("index")] = +e.key
    els[min(length - 1, +e.target.getAttribute("index") + 1)].focus()
  }

  function handlePaste(e) {
    if (Number.isNaN(+e.clipboardData.getData("text"))) return
    waterfall({ target: e.target, arr: e.clipboardData.getData("text") })
  }

  function waterfall(data) {
    let [first, ...rest] = data.arr
    values[data.target.getAttribute("index")] = +first
    els[min(length - 1, +data.target.getAttribute("index") + 1)].focus()
    if (data.target.getAttribute("index") == length - 1 || rest.length === 0)
      return
    waterfall({
      target: els[+data.target.getAttribute("index") + 1],
      arr: rest,
    })
  }

  function range(length) {
    let arr = []

    for (let i = 0; i < length; i++) {
      arr.push(i)
    }

    return arr
  }

  function min(a, b) {
    if (a < b) return a
    return b
  }

  function max(a, b) {
    if (a > b) return a
    return b
  }

  function getTotalLength(idx, arr) {
    return arr
      .slice(0, idx)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  }
</script>

<section class="flex gap-1">
  {#if Array.isArray(length)}
    {#each length as part, idx}
      {#if idx != 0}
        <span>-</span>
      {/if}
      {#each range(part) as index}
        <input
          class="aspect-square w-9 rounded border border-neutral-400 bg-transparent text-center"
          id={index == 0 ? "first-input" : ""}
          type="number"
          on:keydown={handleMoveAndBackspace}
          on:keypress|preventDefault={handleKey}
          on:paste|preventDefault={handlePaste}
          bind:this={els[index + getTotalLength(idx, length)]}
          bind:value={values[index + getTotalLength(idx, length)]}
          index={index + getTotalLength(idx, length)}
        />
      {/each}
    {/each}
  {:else}
    {#each range(length) as index}
      <input
        class="aspect-square w-9 rounded border border-neutral-400 bg-transparent text-center"
        id={index == 0 ? "first-input" : ""}
        on:keydown={handleMoveAndBackspace}
        on:keypress|preventDefault={handleKey}
        on:paste|preventDefault={handlePaste}
        bind:this={els[index]}
        bind:value={values[index]}
        {index}
      />
    {/each}
  {/if}
</section>
