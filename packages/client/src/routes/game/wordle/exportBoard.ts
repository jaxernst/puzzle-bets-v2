// Answers array: max length 6 with each string containing the response to a worlde guess
// "x" = correct letter in correct position
// "c" = correct letter in wrong position
// "_" = incorrect letter
// This function converts those into an emoji representation
export function exportWordleBoard(gameId: string, answers: string[]) {
  const emojiMap = {
    x: "🟩",
    c: "🟨",
    _: "⬜️",
  } as const

  const board = answers
    .map((answer) => {
      return answer
        .split("")
        .map((letter) => {
          if (["x", "c", "_"].includes(letter)) {
            return emojiMap[letter as "x" | "c" | "_"]
          }
          return letter
        })
        .join("")
    })
    .join(" \n")

  return `Wordle Game #${gameId}\n${board}`
}
