import type { EvmAddress } from "$lib"
import { associateFid, checkFidAssociation } from "$lib/server/supabaseClient"

export const GET = async ({ params }) => {
  const { address } = params as { address: EvmAddress }

  const fid = await checkFidAssociation(address)
  if (!fid) return new Response("Not found", { status: 404 })

  return new Response(fid.toString())
}

export const POST = async ({ request, params }) => {
  const { address } = params as { address: EvmAddress }
  const { fid } = (await request.json()) as { fid: number }

  const success = await associateFid(address, fid)
  if (!success) return new Response("Failed", { status: 400 })

  return new Response("Success")
}
