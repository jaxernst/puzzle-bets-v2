<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let data: {
    answers: string[]
    answer: null | string
    guesses: string[]
    badGuess: boolean | undefined
  } = {
    answers: [],
    answer: null,
    guesses: [],
    badGuess: false,
  }

  export let paused = false

  $: badGuess = data.badGuess

  $: won = data.answers[data.answers.length - 1] === "xxxxx"
  $: gameOver = won || data.answers.length >= 6
  $: i = won ? -1 : data.answers.length // Row index of current guess
  $: currentGuess = data.guesses[i] || ""
  $: submittable = currentGuess.length === 5

  /**
   * A map of classnames for all letters that have been guessed,
   * used for styling the keyboard
   */
  let classnames: Record<string, "exact" | "close" | "missing">

  /**
   * A map of descriptions for all letters that have been guessed,
   * used for adding text for assistive technology (e.g. screen readers)
   */
  let description: Record<string, string>

  $: {
    classnames = {}
    description = {}

    data.answers.forEach((answer, i) => {
      const guess = data.guesses[i]

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
  }

  // Add or remove a letter from the current guess
  function updateCurrentGuess(event: MouseEvent) {
    const key = (event.target as HTMLButtonElement).getAttribute("data-key")

    if (key === "backspace") {
      currentGuess = currentGuess.slice(0, -1)
    } else if (currentGuess.length < 5) {
      currentGuess += key
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

    if (event.key === "Enter" && !submittable) return

    document
      .querySelector(`[data-key="${event.key}" i]`)
      ?.dispatchEvent(new MouseEvent("click", { cancelable: true }))
  }

  const dispatch = createEventDispatcher()

  $: if (won) {
    dispatch("gameOver", { won: true })
  }

  $: if (data.answers.length >= 6 && !won) {
    dispatch("gameOver", { won: false })
  }
</script>

<svelte:window on:keydown={keydown} />

<svelte:head>
  <title>Puzzle Bets | Wordle</title>
  <meta name="description" content="A puzzle bets worlde game" />
</svelte:head>

<h1 class="visually-hidden">Sverdle</h1>

<form
  method="POST"
  class="w-full"
  on:submit={(e) => {
    e.preventDefault()
    badGuess = false
    dispatch("submitGuess", { guess: currentGuess })
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
          {@const guess = current ? currentGuess : data.guesses[row]}
          {@const answer = data.answers[row]?.[column]}
          {@const value = guess?.[column] ?? ""}
          {@const selected = current && column === guess.length}
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
      {:else if data.answers.length >= 6}
        <p class="text-neutral-500">the answer was "{data.answer}"!</p>
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
            on:click|preventDefault={updateCurrentGuess}
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
                  on:click|preventDefault={updateCurrentGuess}
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

  .how-to-play {
    color: var(--color-text);
  }

  .how-to-play::before {
    content: "i";
    display: inline-block;
    font-size: 0.8em;
    font-weight: 900;
    width: 1em;
    height: 1em;
    padding: 0.2em;
    line-height: 1;
    border: 1.5px solid var(--color-text);
    border-radius: 50%;
    text-align: center;
    margin: 0 0.5em 0 0;
    position: relative;
    top: -0.05em;
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
    border: none;
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
    background: var(--color-theme-1);
    color: white;
  }

  .letter.close {
    background: var(--color-theme-2);
    color: white;
  }

  .selected {
    outline: 2px solid #eacb28;
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
</style>
