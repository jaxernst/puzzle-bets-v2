import { createClient } from "@supabase/supabase-js"
import { PUBLIC_CHAIN_ID, PUBLIC_SUPA_API_URL } from "$env/static/public"
import {
  PRIVATE_4242_INDEXER_API_URL,
  PRIVATE_4242_INDEXER_SERVICE_KEY,
  PRIVATE_84532_INDEXER_API_URL,
  PRIVATE_84532_INDEXER_SERVICE_KEY,
  PRIVATE_SUPA_SERVICE_KEY,
} from "$env/static/private"
import type { EvmAddress } from "$lib"

export const supabase = createClient(
  PUBLIC_SUPA_API_URL,
  PRIVATE_SUPA_SERVICE_KEY,
)

export const indexerClient = (() => {
  let indexerApiUrl, indexerServiceKey

  if (Number(PUBLIC_CHAIN_ID) === 4242) {
    indexerApiUrl = PRIVATE_4242_INDEXER_API_URL
    indexerServiceKey = PRIVATE_4242_INDEXER_SERVICE_KEY
  }

  if (Number(PUBLIC_CHAIN_ID) === 84532) {
    indexerApiUrl = PRIVATE_84532_INDEXER_API_URL
    indexerServiceKey = PRIVATE_84532_INDEXER_SERVICE_KEY
  }

  if (!indexerApiUrl || !indexerServiceKey) return

  return createClient(indexerApiUrl, indexerServiceKey, {
    db: {
      schema: "mud",
    },
  })
})()

export async function getDisplayName(user: EvmAddress) {
  const { data } = await supabase
    .from("display-names")
    .select("display_name")
    .eq("address", user)
    .single()

  return data?.display_name ?? null
}

export async function setDisplayName(user: EvmAddress, displayName: string) {
  const { data, error } = await supabase
    .from("display-names")
    .upsert({ address: user, display_name: displayName })
    .select()
    .single()

  if (error?.details.includes("already exists")) {
    return [null, "Display name already exists"]
  }

  if (error) {
    console.error("Error setting display name:", error)
    return [null, "Unknown error"]
  }

  return [data, null]
}
