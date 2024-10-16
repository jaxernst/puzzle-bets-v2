import { setDisplayName } from "$lib/server/supabaseClient"

export const POST = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response("Not Authenticated", { status: 401 })
  }

  const body = await request.json()
  const { displayName } = body as { displayName: string | null }

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
