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
import type { FrameNotificationDetails } from "@farcaster/frame-sdk"

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

// Display names //

export async function getDisplayName(user: EvmAddress) {
  const { data } = await supabase
    .from("display-names")
    .select("display_name")
    .eq("address", user)
    .single()

  return data?.display_name ?? null
}

export async function setDisplayName(
  user: EvmAddress,
  displayName: string | null,
) {
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

// Drip record //

export async function getEthDripped(user: EvmAddress): Promise<number> {
  const { data } = await supabase
    .from("drip-record")
    .select("eth_dripped")
    .eq("address", user)
    .single()

  return data?.eth_dripped ?? 0
}

export async function setEthDripped(user: EvmAddress, dripped: number) {
  const { data, error } = await supabase
    .from("drip-record")
    .upsert({ address: user, eth_dripped: dripped })
    .select()
    .single()

  if (error) {
    console.error("Error setting drip record:", error)
  }

  return data
}

// Farcaster User Association //

export async function associateFid(user: EvmAddress, fid: number) {
  // Add to 'fid-associations' table
  const { error } = await supabase
    .from("fid-associations")
    .upsert({ address: user, fid })
    .select()
    .single()

  return !error
}

export async function checkFidAssociation(user: EvmAddress) {
  const { data } = await supabase
    .from("fid-associations")
    .select("fid")
    .eq("address", user)
    .single()

  return data?.fid ?? null
}

export async function getAssociatedAddresses(fid: number) {
  const { data } = await supabase
    .from("fid-associations")
    .select("address")
    .eq("fid", fid)

  return data?.map((d) => d.address) ?? []
}

// Faracster Frame Notifications //

export async function updateFrameNotificationState(
  userAddrs: EvmAddress[],
  notification: FrameNotificationDetails | null,
) {
  let result
  if (!notification) {
    result = await supabase
      .from("frame-notifications")
      .delete()
      .in("address", userAddrs)
      .select()
      .single()
  } else {
    result = await supabase
      .from("frame-notifications")
      .upsert(
        userAddrs.map((addr) => ({
          address: addr,
          token: notification?.token,
          url: notification?.url,
        })),
      )
      .select()
  }

  if (result.error) {
    console.error("Error updating frame notification:", result.error)
  }

  return result.data
}

export async function getFrameNotificationState(user: EvmAddress) {
  const { data } = await supabase
    .from("frame-notifications")
    .select("token, url")
    .eq("address", user)
    .single()

  return data
}
