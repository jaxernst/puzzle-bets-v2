import type { EvmAddress } from "$lib"
import { getDisplayName } from "$lib/server/supabaseClient"

export const GET = async ({ params }) => {
  const displayName = await getDisplayName(params.user_address as EvmAddress)
  return new Response(JSON.stringify({ name: displayName ?? null }))
}
