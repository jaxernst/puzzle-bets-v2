import { createClient } from "@supabase/supabase-js"
import { PUBLIC_CHAIN_ID, PUBLIC_SUPA_API_URL } from "$env/static/public"
import {
  PRIVATE_4242_INDEXER_API_URL,
  PRIVATE_4242_INDEXER_SERVICE_KEY,
  PRIVATE_84532_INDEXER_API_URL,
  PRIVATE_84532_INDEXER_SERVICE_KEY,
  PRIVATE_SUPA_SERVICE_KEY,
} from "$env/static/private"

export const supabase = createClient(
  PUBLIC_SUPA_API_URL,
  PRIVATE_SUPA_SERVICE_KEY,
)

const [indexerServiceKey, indexerApiUrl] = (() => {
  if (Number(PUBLIC_CHAIN_ID) === 4242)
    return [PRIVATE_4242_INDEXER_SERVICE_KEY, PRIVATE_4242_INDEXER_API_URL]

  if (Number(PUBLIC_CHAIN_ID) === 84532)
    return [PRIVATE_84532_INDEXER_SERVICE_KEY, PRIVATE_84532_INDEXER_API_URL]

  console.error("No indexer available for chain", PUBLIC_CHAIN_ID)
  return ["", ""]
})()

export const indexerClient = createClient(indexerApiUrl, indexerServiceKey, {
  db: {
    schema: "mud",
  },
})
