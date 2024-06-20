import { words, allowed } from "./words"

export class Game {
  MAX_GUESSES = 6
  WORD_LENGTH = 5

  index: number
  guesses: string[]
  answers: string[]
  answer: string

  /**
   * Create a game object from existing state, or initialise a new game
   */
  constructor(serialized: string | undefined = undefined) {
    if (serialized) {
      const [index, guesses, answers] = serialized.split("-")

      this.index = +index
      this.guesses = guesses ? guesses.split(" ") : []
      this.answers = answers ? answers.split(" ") : []
    } else {
      this.index = Math.floor(Math.random() * words.length)
      this.guesses = ["", "", "", "", "", ""]
      this.answers = []
    }

    this.answer = words[this.index]
  }

  /**
   * Update game state based on a guess of a five-letter word. Returns
   * true if the guess was valid, false otherwise
   */
  enter(word: string) {
    const valid = allowed.has(word)
    const letters = word.split("")

    if (!valid) return false
    if (this._numGuesses() >= this.MAX_GUESSES) return false

    this.guesses[this.answers.length] = word

    const available = Array.from(this.answer)
    const answer = Array(this.WORD_LENGTH).fill("_")

    // first, find exact matches
    for (let i = 0; i < this.WORD_LENGTH; i += 1) {
      if (letters[i] === available[i]) {
        answer[i] = "x"
        available[i] = " "
      }
    }

    // then find close matches (this has to happen
    // in a second step, otherwise an early close
    // match can prevent a later exact match)
    for (let i = 0; i < this.WORD_LENGTH; i += 1) {
      if (answer[i] === "_") {
        const index = available.indexOf(letters[i])
        if (index !== -1) {
          answer[i] = "c"
          available[index] = " "
        }
      }
    }

    this.answers.push(answer.join(""))

    return true
  }

  /**
   * Serialize game state so it can be set as a cookie
   */
  toString() {
    return `${this.index}-${this.guesses.join(" ")}-${this.answers.join(" ")}`
  }

  won() {
    return this.answers.at(-1) === "xxxxx"
  }

  /**
   * Scoring:
   *  - 0 if not solved
   *  - 6 if solved in 1
   *  - 5 if solved in 2
   *  - 4 ig solved in 3
   *  etc.
   */
  score() {
    if (this.won()) {
      return this.MAX_GUESSES + 1 - this._numGuesses()
    }
    return 0
  }

  _numGuesses() {
    return this.guesses.filter((x) => x.length).length
  }
}
