import { PUBLIC_CHAIN_ID } from "$env/static/public"
import { indexerClient } from "$lib/server/supabaseClient.js"
import { decodeDynamicField } from "@latticexyz/protocol-parser/internal"

const fallbackHex = (str?: string) => {
  return (str ?? "0x").replace("\\x", "0x") as `0x${string}`
}

export const GET = async () => {
  if (PUBLIC_CHAIN_ID === "31337") {
    return new Response("Not on public chain", { status: 400 })
  }

  const { data, error } = await indexerClient.rpc("get_indexer_records", {
    chain: PUBLIC_CHAIN_ID,
  })

  if (error) {
    console.log(error)
    return new Response("Error fetching records", { status: 500 })
  }

  const logRecords = data
    .map(
      (row: any) =>
        ({
          address: fallbackHex(row.address),
          eventName: "Store_SetRecord",
          args: {
            tableId: fallbackHex(row.table_id),
            keyTuple: decodeDynamicField(
              "bytes32[]",
              fallbackHex(row.key_bytes),
            ),
            staticData: fallbackHex(row.static_data),
            encodedLengths: fallbackHex(row.encoded_lengths),
            dynamicData: fallbackHex(row.dynamic_data),
          },
        }) as const,
    )
    .filter((x: any) => {
      // TODO: Temp fix for indexer state bug -> entity '3f' has invalid state indexed, so filter it out
      return (
        x.args.keyTuple ===
        "0x000000000000000000000000000000000000000000000000000000000000003f"
      )
    })

  return new Response(
    JSON.stringify({
      blockNumber: data[0].block_number.toString(),
      logs: logRecords,
    }),
    { status: 200 },
  )
}
