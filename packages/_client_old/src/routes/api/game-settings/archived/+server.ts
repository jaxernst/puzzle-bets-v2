import { supabaseGameSettingsStore } from "$lib/server/gameStateStorage"

export const GET = async ({ locals }) => {
  const user = locals.user
  const games = await supabaseGameSettingsStore.getArchivedGames(user)
  return new Response(JSON.stringify(games))
}
