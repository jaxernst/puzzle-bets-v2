import { supabaseGameSettingsStore } from "$lib/server/gameStateStorage"

export const POST = async ({ request, locals }) => {
  const user = locals.user
  const { gameId, archived } = (await request.json()) as {
    gameId: number
    archived: boolean
  }

  if (typeof gameId !== "number" || typeof archived !== "boolean" || !user) {
    return new Response("Missing parameter", { status: 400 })
  }

  const res = await supabaseGameSettingsStore.setArchiveState(
    gameId,
    user,
    archived,
  )

  return new Response(JSON.stringify(res))
}
