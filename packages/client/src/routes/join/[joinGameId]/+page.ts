import { capitalized, formatAsDollar } from "$lib/util"

export async function load({ url }) {
  const gameTypeParam = url?.searchParams.get("puzzleType")
  const gameType = gameTypeParam ? capitalized(gameTypeParam) : ""

  const senderNameParam = url?.searchParams.get("from")
  const senderName = senderNameParam
    ? senderNameParam.split("_").join(" ")
    : null

  const usdValue = url?.searchParams.get("valUsd")

  const challengeAmountString = usdValue
    ? formatAsDollar(Number(usdValue)) + " "
    : ""

  let title = "Puzzle Bets!"
  if (senderName) {
    title += ` ${senderName} challenged you to a ${challengeAmountString}${gameType} game`
  } else {
    title += ` You've been challenged to a ${challengeAmountString}${gameType} game`
  }

  const description = "Accept the challenge and solve the puzzle to win the pot"

  return {
    description,
    title,
    usdValue,
  }
}
