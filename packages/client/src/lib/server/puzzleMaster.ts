import { privateKeyToAccount } from "viem/accounts"
import { PUZZLE_MASTER_PRIVATE_KEY } from "$env/static/private"
import type { EvmAddress } from "$lib/types"
import { encodePacked } from "viem"
import { intToEntity } from "$lib/util"

export const puzzleMasterSigner = privateKeyToAccount(
  PUZZLE_MASTER_PRIVATE_KEY as `0x${string}`,
)

export async function signPlayerSolvedMessage(
  gameId: number,
  player: EvmAddress,
  gameScore: number,
) {
  const encodedMessage = encodePacked(
    ["bytes32", "address", "uint32"],
    [intToEntity(gameId) as `0x${string}`, player, gameScore],
  )

  return await puzzleMasterSigner.signMessage({
    message: {
      raw: encodedMessage,
    },
  })
}
