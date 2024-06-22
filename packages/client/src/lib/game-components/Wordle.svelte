<script lang="ts">
  let {
    answers = [],
    answer = null,
    guesses = [],
    badGuess = false,
    paused = false,
    onSubmitGuess = () => {},
    onGameOver = () => {},
  } = $props<{
    answers: string[]
    answer: null | string
    guesses: string[]
    badGuess: boolean | undefined
    paused?: boolean
    onSubmitGuess: (guess: string) => void
    onGameOver: (won: boolean) => void
  }>()

  let won = $derived(answers[answers.length - 1] === "xxxxx")
  let gameOver = $derived(won || answers.length >= 6)
  let i = $derived(won ? -1 : answers.length) // Row index of current guess

  let currentGuess = $state("")

  $effect(() => {
    currentGuess = guesses[i] ?? ""
  })

  let submittable = $derived(currentGuess?.length === 5)

  $inspect(currentGuess, i)

  /**
   * A map of classnames for all letters that have been guessed,
   * used for styling the keyboard
   */
  let classnames: Record<string, "exact" | "close" | "missing"> = $state({})

  /**
   * A map of descriptions for all letters that have been guessed,
   * used for adding text for assistive technology (e.g. screen readers)
   */
  let description: Record<string, string> = $state({})

  $effect(() => {
    answers.forEach((answer: string, i: number) => {
      const guess = guesses[i]

      for (let i = 0; i < 5; i += 1) {
        const letter = guess[i]

        if (answer[i] === "x") {
          classnames[letter] = "exact"
          description[letter] = "correct"
        } else if (!classnames[letter]) {
          classnames[letter] = answer[i] === "c" ? "close" : "missing"
          description[letter] = answer[i] === "c" ? "present" : "absent"
        }
      }
    })
  })

  // Add or remove a letter from the current guess
  function updateCurrentGuess(pressedKey: string) {
    if (pressedKey === "backspace") {
      currentGuess = currentGuess.slice(0, -1)
    } else if (pressedKey.length === 1 && currentGuess.length < 5) {
      currentGuess += pressedKey
    }
  }

  /**
   * Trigger form logic in response to a keydown event, so that
   * desktop users can use the keyboard to play the game
   */
  function keydown(event: KeyboardEvent) {
    const activeElement = document.activeElement
    if (activeElement?.tagName === "INPUT") return
    if (event.metaKey) return
    if (event.key === "Enter" && submittable) {
      badGuess = false
      onSubmitGuess(currentGuess)
    }

    if (event.key === "Backspace") updateCurrentGuess("backspace")
    if (/^[a-zA-Z]$/.test(event.key)) updateCurrentGuess(event.key)
  }

  $effect(() => {
    if (won) {
      onGameOver(true)
    }

    if (answers.length >= 6 && !won) {
      onGameOver(false)
    }
  })
</script>

<svelte:window on:keydown={keydown} />

<svelte:head>
  <title>Puzzle Bets | Wordle</title>
  <meta name="description" content="A puzzle bets worlde game" />
</svelte:head>

<form
  method="POST"
  class="w-full"
  onsubmit={(e) => {
    e.preventDefault()
    badGuess = false

    onSubmitGuess(currentGuess)
  }}
>
  <div class="flex gap-3 text-xs italic text-neutral-600">
    <div class="flex items-center gap-1 whitespace-nowrap">
      Correct
      <div class="letter exact px-2"></div>
    </div>
    <div class="flex items-center gap-1 whitespace-nowrap">
      Close
      <div class="letter close px-2"></div>
    </div>

    <div class="flex items-center gap-1 whitespace-nowrap">
      Missing
      <div class="letter missing px-2"></div>
    </div>
  </div>

  <div class="grid" class:playing={!won} class:bad-guess={badGuess}>
    {#each Array.from(Array(6).keys()) as row (row)}
      {@const current = row === i}
      <h2 class="visually-hidden">Row {row + 1}</h2>
      <div class="row" class:current>
        {#each Array.from(Array(5).keys()) as column (column)}
          {@const guess = current ? currentGuess : guesses[row]}
          {@const answer = answers[row]?.[column]}
          {@const value = guess?.[column] ?? ""}
          {@const selected = current && column === guess?.length}
          {@const exact = answer === "x"}
          {@const close = answer === "c"}
          {@const missing = answer === "_"}
          <div
            class="letter"
            class:exact
            class:close
            class:missing
            class:selected
          >
            {value}
            <span class="visually-hidden">
              {#if exact}
                (correct)
              {:else if close}
                (present)
              {:else if missing}
                (absent)
              {:else}
                empty
              {/if}
            </span>
            <input name="guess" disabled={!current} type="hidden" {value} />
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <div>
    <div class={`controls ${!(gameOver || paused) ? "controls-playing" : ""}`}>
      {#if won}
        <p class="text-neutral-500">You solved it!</p>
      {:else if answers.length >= 6}
        <p class="text-neutral-500">the answer was "{answer}"!</p>
        <!--
      <button
        data-key="enter"
        class="restart selected"
        on:click={(e) => {
          e.preventDefault();
          dispatch("restart");
        }}
      >
        {won
          ? "you solved the puzzle. Wait for the deadline to view results :)"
          : `game over :(`} play again?
      </button>-->
      {:else if !paused}
        <div class="keyboard">
          <button
            data-key="enter"
            class:selected={submittable}
            disabled={!submittable}>enter</button
          >

          <button
            onclick={(e) => {
              e.preventDefault()
              updateCurrentGuess("backspace")
            }}
            data-key="backspace"
            name="key"
            value="backspace"
          >
            back
          </button>

          {#each ["qwertyuiop", "asdfghjkl", "zxcvbnm"] as row}
            <div class="row">
              {#each row as letter}
                <button
                  onclick={(e) => {
                    e.preventDefault()
                    updateCurrentGuess(letter)
                  }}
                  data-key={letter}
                  class={classnames[letter]}
                  disabled={submittable}
                  name="key"
                  value={letter}
                  aria-label="{letter} {description[letter] || ''}"
                >
                  {letter}
                </button>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</form>

<style>
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex: 1;
  }

  .grid {
    --width: min(100vw, 40vh, 380px);
    max-width: var(--width);
    align-self: center;
    justify-self: center;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .grid .row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 0.2rem;
    margin: 0 0 0.2rem 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .grid.bad-guess .row.current {
      animation: wiggle 0.5s;
    }
  }

  .grid.playing .row.current {
    filter: drop-shadow(3px 3px 10px, black);
  }

  .letter {
    aspect-ratio: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
    text-transform: lowercase;
    font-size: calc(0.08 * var(--width));
    border-radius: 4px;
    background: white;
    margin: 0;
    color: rgba(0, 0, 0, 0.7);
  }

  .letter.missing {
    background: rgba(255, 255, 255, 0.5);
    color: rgba(0, 0, 0, 0.5);
  }

  .letter.exact {
    @apply bg-green-600 text-white;
  }

  .letter.close {
    @apply bg-orange-600 text-white;
  }

  .selected {
    @apply border-x border-b-4 border-t border-black;
  }

  .controls {
    text-align: center;
    justify-content: center;
  }

  .controls-playing {
    height: min(18vh, 10rem);
  }

  .keyboard {
    --gap: 0.2rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    height: 100%;
  }

  .keyboard .row {
    display: flex;
    justify-content: center;
    gap: 0.2rem;
    flex: 1;
  }

  .keyboard button,
  .keyboard button:disabled {
    --size: min(8vw, 4vh, 40px);
    background-color: white;
    color: black;
    width: var(--size);
    border: none;
    border-radius: 2px;
    font-size: calc(var(--size) * 0.5);
    margin: 0;
  }

  .keyboard button.exact {
    background: var(--color-theme-1);
    color: white;
  }

  .keyboard button.missing {
    opacity: 0.5;
  }

  .keyboard button.close {
    border: 2px solid var(--color-theme-2);
  }

  .keyboard button:focus {
    background: var(--color-theme-1);
    color: white;
    outline: none;
  }

  .keyboard button[data-key="enter"],
  .keyboard button[data-key="backspace"] {
    position: absolute;
    bottom: 0;
    width: calc(1.5 * var(--size));
    height: calc(1 / 3 * (100% - 2 * var(--gap)));
    text-transform: uppercase;
    font-size: calc(0.3 * var(--size));
    padding-top: calc(0.15 * var(--size));
  }

  .keyboard button[data-key="enter"] {
    right: calc(50% + 3.5 * var(--size) + 0.8rem);
  }

  .keyboard button[data-key="backspace"] {
    left: calc(50% + 3.5 * var(--size) + 0.8rem);
  }

  .keyboard button[data-key="enter"]:disabled {
    opacity: 0.5;
  }

  .restart {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
    border: none;
  }

  .restart:focus,
  .restart:hover {
    background: var(--color-theme-1);
    color: white;
    outline: none;
  }

  @keyframes wiggle {
    0% {
      transform: translateX(0);
    }
    10% {
      transform: translateX(-2px);
    }
    30% {
      transform: translateX(4px);
    }
    50% {
      transform: translateX(-6px);
    }
    70% {
      transform: translateX(+4px);
    }
    90% {
      transform: translateX(-2px);
    }
    100% {
      transform: translateX(0);
    }
  }

  .visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: auto;
    margin: 0;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    white-space: nowrap;
  }
</style>
