import { PUBLIC_CHAIN_ID } from "$env/static/public"
import type { PuzzleType } from "$lib/types"
import { supabase } from "./supabaseClient"

const chainId = PUBLIC_CHAIN_ID

export const gameStateTable = (demoGame?: boolean) => {
  return `game-state-${demoGame ? "demo" : chainId}`
}

interface GameStore {
  hasGame: (
    gameType: PuzzleType,
    gameId: string,
    user?: string,
    isDemo?: boolean,
  ) => Promise<boolean>
  getGame: (
    gameType: PuzzleType,
    gameId: string,
    user?: string,
    isDemo?: boolean,
  ) => Promise<string>
  setGame: (
    gameState: string,
    gameType: PuzzleType,
    gameId: string,
    user?: string,
    isDemo?: boolean,
  ) => Promise<boolean>
  createDuelGame: (
    gameState: string,
    gameType: PuzzleType,
    gameId: string,
    p1: string,
    p2: string,
  ) => Promise<boolean>
  resetDuelGame: (
    gameId: string,
    newGameState: string,
    chainRematchCount: number,
  ) => Promise<boolean>
}

export const supabaseGameStore: GameStore = {
  hasGame: async (gameType, gameId, user, isDemo) => {
    if (isDemo) user = undefined
    const res = await supabase
      .from(gameStateTable(isDemo))
      .select("*")
      .eq("game_type", gameType)
      .eq("game_id", gameId)
      .eq("user_address", user ?? "NULL")
      .single()

    return Boolean(res.data)
  },
  getGame: async (gameType, gameId, user, isDemo) => {
    if (isDemo) user = undefined
    const res = await supabase
      .from(gameStateTable(isDemo))
      .select("*")
      .eq("game_type", gameType)
      .eq("game_id", gameId)
      .eq("user_address", user ?? "NULL")
      .single()

    return res.data && res.data.game_state
  },
  setGame: async (newGameState, gameType, gameId, user, isDemo) => {
    if (isDemo) user = undefined
    const res = await supabase.from(gameStateTable(isDemo)).upsert({
      game_id: gameId,
      game_type: gameType,
      game_state: newGameState,
      user_address: user,
    })

    return Boolean(res.error)
  },
  createDuelGame: async (newGameState, gameType, gameId, p1, p2) => {
    const res = await supabase.rpc("create_duel_game", {
      _chain_id: chainId,
      _game_id: Number(gameId),
      _game_type: gameType,
      _game_state: newGameState,
      _p1_address: p1,
      _p2_address: p2,
    })

    if (res.error) return false

    return res.data
  },
  resetDuelGame: async (gameId, newGameState, chainResetCount) => {
    const res = await supabase.rpc("reset_duel_game", {
      _chain_id: chainId,
      _game_id: Number(gameId),
      _chain_reset_count: chainResetCount,
      _init_game_state: newGameState,
    })

    if (res.error) return false

    return res.data
  },
}

export const getGameResetCount = async (gameId: string, isDemo?: boolean) => {
  const res = await supabase
    .from(gameStateTable(isDemo))
    .select("reset_count")
    .eq("game_id", gameId)

  return res.data && res.data[0].reset_count
}

interface GameSettingsStore {
  setArchiveState: (
    gameId: number,
    user: string,
    archived: boolean,
  ) => Promise<boolean>
  getArchivedGames: (user: string) => Promise<string[]>
}

export const supabaseGameSettingsStore: GameSettingsStore = {
  setArchiveState: async (gameId, user, archived) => {
    const res = await supabase.from("user-game-settings").upsert({
      game_id: gameId,
      user_address: user,
      archived,
    })

    return Boolean(res.error)
  },
  getArchivedGames: async (user) => {
    const res = await supabase
      .from("user-game-settings")
      .select("game_id")
      .eq("user_address", user)
      .eq("archived", true)

    return res.data?.map((row) => row.game_id) ?? []
  },
}
