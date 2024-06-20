import { type Entity } from "@latticexyz/recs";
import type { SetupNetworkResult } from "./setupNetwork";
import { gameTypeToNumber, type EvmAddress, type PuzzleType } from "$lib/types";
import { padHex, parseEther } from "viem";
import { hashString, systemTimestamp } from "$lib/util";
import { env } from "$env/dynamic/public";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */
export function createSystemCalls({
  worldContract,
  waitForTransaction,
}: SetupNetworkResult) {
  const newGame = async (
    gameType: PuzzleType,
    wagerEth: number,
    submissionWindowMinutes: number,
    inviteExpirationMinutes: number,
    password?: string
  ) => {
    const inviteExpirationTimestamp = BigInt(
      systemTimestamp() + inviteExpirationMinutes * 60
    );

    const passwordHash = password
      ? hashString(password)
      : padHex("0x0", { size: 32 });

    const tx = await worldContract.write.v1__newGame(
      [
        gameTypeToNumber[gameType],
        submissionWindowMinutes * 60,
        inviteExpirationTimestamp,
        env.PUBLIC_PUZZLE_MASTER_ADDRESS as EvmAddress,
        passwordHash,
      ],
      { value: parseEther(wagerEth.toString()) }
    );

    await waitForTransaction(tx);
  };

  const joinGame = async (
    gameId: Entity,
    wagerEth: number,
    password?: string
  ) => {
    let tx: `0x${string}`;
    if (password) {
      tx = await worldContract.write.v1__joinGame(
        [gameId as `0x${string}`, password],
        {
          value: parseEther(wagerEth.toString()),
        }
      );
    } else {
      tx = await worldContract.write.v1__joinGame([gameId as `0x${string}`], {
        value: parseEther(wagerEth.toString()),
      });
    }

    await waitForTransaction(tx);
  };

  const submitSolution = async (
    gameId: Entity,
    score: number,
    solutionSignature: `0x${string}`
  ) => {
    const tx = await worldContract.write.v1__submitSolution([
      gameId as `0x${string}`,
      score,
      solutionSignature,
    ]);
    await waitForTransaction(tx);
  };

  const claim = async (gameId: Entity) => {
    const tx = await worldContract.write.v1__claim([gameId as `0x${string}`]);
    await waitForTransaction(tx);
  };

  const voteRematch = async (gameId: Entity) => {
    const tx = await worldContract.write.v1__voteRematch([
      gameId as `0x${string}`,
    ]);
    await waitForTransaction(tx);
  };

  const cancelPendingGame = async (gameId: Entity) => {
    const tx = await worldContract.write.v1__cancelPendingGame([
      gameId as `0x${string}`,
    ]);
    await waitForTransaction(tx);
  };

  return {
    newGame,
    joinGame,
    submitSolution,
    claim,
    voteRematch,
    cancelPendingGame,
  };
}
