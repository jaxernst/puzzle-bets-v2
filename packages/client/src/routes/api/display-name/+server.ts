import { getDisplayName, setDisplayName } from "$lib/server/supabaseClient"

export const GET = async ({ locals }) => {
  if (!locals.user) throw "Should be authenticated"

  const displayName = await getDisplayName(locals.user)
  return new Response(JSON.stringify({ name: displayName ?? null }))
}

export const POST = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response("Not Authenticated", { status: 401 })
  }

  const body = await request.json()
  const { displayName } = body

  if (!displayName) {
    return new Response("Display name is required", { status: 400 })
  }

  const [result, error] = await setDisplayName(locals.user, displayName)
  if (result) {
    return new Response(JSON.stringify({ ok: true }))
  } else {
    if (error === "Display name already exists") {
      return new Response(JSON.stringify({ error }), { status: 409 })
    } else {
      return new Response(JSON.stringify({ error }), { status: 500 })
    }
  }
}
