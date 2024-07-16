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
