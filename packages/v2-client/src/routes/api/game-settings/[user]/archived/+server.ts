import { supabaseGameSettingsStore } from "$lib/server/gameStateStorage.js"

export const GET = async ({ params }) => {
  const { user } = params
  const games = await supabaseGameSettingsStore.getArchivedGames(user)
  return new Response(JSON.stringify(games))
}
