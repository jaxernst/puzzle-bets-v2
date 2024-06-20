import type { Entity } from "@latticexyz/recs";

export type EvmAddress = `0x${string}`;

export type Game = {
  id: Entity;
  type: PuzzleType;
  status: GameStatus;
  p1: EvmAddress;
  p2?: EvmAddress;
  betAmount?: bigint;
  startTime?: bigint;
  submissionWindow: number;
  inviteExpiration: bigint;
};

export type StartedGame = {
  id: Entity;
  type: PuzzleType;
  status: GameStatus.Active | GameStatus.Complete;
  p1: EvmAddress;
  p2: EvmAddress;
  buyInAmount: bigint;
  p1Balance: bigint;
  p2Balance: bigint;
  startTime: bigint;
  submissionWindow: number;
  inviteExpiration: bigint;
  p1Rematch: boolean | undefined;
  p2Rematch: boolean | undefined;
  rematchCount: number;
};

export type PuzzleType = "wordle" | "connections" | "crossword" | "sudoku";

export const gameTypeToNumber: Record<PuzzleType, number> = {
  wordle: 0,
  connections: 1,
  crossword: 2,
  sudoku: 3,
};

export const gameNumberToType: Record<number, PuzzleType> = {
  0: "wordle",
  1: "connections",
};

export enum GameStatus {
  Inactive,
  Pending,
  Active,
  Complete,
}
