import { PUBLIC_CHAIN_ID } from "$env/static/public"
import { PRIVATE_84532_INDEXER_DATABASE_URL } from "$env/static/private"

import { isNotNull } from "@latticexyz/common/utils"
import type { PendingQuery, Row, Sql } from "postgres"
import { hexToBytes } from "viem"
import { schemasTable, type StorageAdapterLog } from "@latticexyz/store-sync"
import { decodeDynamicField } from "@latticexyz/protocol-parser/internal"

import { type Hex } from "viem"
import postgres from "postgres"

export type RecordData = {
  address: Hex
  tableId: Hex
  keyBytes: Hex
  staticData: Hex | null
  encodedLengths: Hex | null
  dynamicData: Hex | null
  recordBlockNumber: string
  logIndex: number
}

export type RecordMetadata = {
  indexerVersion: string
  chainId: string
  chainBlockNumber: string
  totalRows: number
}

export type Record = RecordData & RecordMetadata

const schemaName = "mud"

if (!PRIVATE_84532_INDEXER_DATABASE_URL) {
  throw new Error("PRIVATE_84532_INDEXER_DATABASE_URL is not set")
}

const database = postgres(PRIVATE_84532_INDEXER_DATABASE_URL, {
  prepare: false,
})

function and(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} AND ${condition}`)})`
}

function or(sql: Sql, conditions: PendingQuery<Row[]>[]): PendingQuery<Row[]> {
  return sql`(${conditions.reduce((query, condition) => sql`${query} OR ${condition}`)})`
}

function queryLogs(sql: Sql, opts: any): PendingQuery<Record[]> {
  const conditions = opts.filters.length
    ? opts.filters.map((filter: any) =>
        and(
          sql,
          [
            opts.address != null
              ? sql`address = ${hexToBytes(opts.address)}`
              : null,
            sql`table_id = ${hexToBytes(filter.tableId)}`,
            filter.key0 != null ? sql`key0 = ${hexToBytes(filter.key0)}` : null,
            filter.key1 != null ? sql`key1 = ${hexToBytes(filter.key1)}` : null,
          ].filter(isNotNull),
        ),
      )
    : opts.address != null
      ? [sql`address = ${hexToBytes(opts.address)}`]
      : []

  const where = sql`WHERE ${and(
    sql,
    [
      sql`is_deleted != true`,
      conditions.length ? or(sql, conditions) : null,
    ].filter(isNotNull),
  )}`

  return sql<Record[]>`
    WITH
      config AS (
        SELECT
          version AS "indexerVersion",
          chain_id AS "chainId",
          block_number AS "chainBlockNumber"
        FROM ${sql(`${schemaName}.config`)}
        LIMIT 1
      ),
      records AS (
        SELECT
          '0x' || encode(address, 'hex') AS address,
          '0x' || encode(table_id, 'hex') AS "tableId",
          '0x' || encode(key_bytes, 'hex') AS "keyBytes",
          '0x' || encode(static_data, 'hex') AS "staticData",
          '0x' || encode(encoded_lengths, 'hex') AS "encodedLengths",
          '0x' || encode(dynamic_data, 'hex') AS "dynamicData",
          block_number AS "recordBlockNumber",
          log_index AS "logIndex"
        FROM ${sql(`${schemaName}.records`)}
        ${where}
        ORDER BY block_number, log_index ASC
      )
    SELECT
      (SELECT COUNT(*) FROM records) AS "totalRows",
      *
    FROM config, records
  `
}

function recordToLog(
  record: Omit<RecordData, "recordBlockNumber">,
): Extract<StorageAdapterLog, { eventName: "Store_SetRecord" }> {
  return {
    address: record.address,
    eventName: "Store_SetRecord",
    args: {
      tableId: record.tableId,
      keyTuple: decodeDynamicField("bytes32[]", record.keyBytes),
      staticData: record.staticData ?? "0x",
      encodedLengths: record.encodedLengths ?? "0x",
      dynamicData: record.dynamicData ?? "0x",
    },
  } as const
}

export const GET = async ({ url }) => {
  // Check if we're on a public chain
  if (PUBLIC_CHAIN_ID === "31337") {
    return new Response("Not on public chain", { status: 400 })
  }

  // Parse and validate input
  let options
  try {
    const input = url.searchParams.get("input")
    options = input ? JSON.parse(input) : {}
  } catch (e) {
    console.error("Error parsing input:", e)
    return new Response("Invalid input format", { status: 400 })
  }

  try {
    // Add schema table filter if there are existing filters
    options.filters =
      options.filters?.length > 0
        ? [...options.filters, { tableId: schemasTable.tableId }]
        : []

    // Query the database
    const records = await queryLogs(database, options ?? {}).execute()

    // Check if records exist
    if (records.length === 0) {
      console.error(
        `No logs found for chainId ${options.chainId}, address ${options.address}, filters ${JSON.stringify(
          options.filters,
        )}`,
      )
      return new Response("No logs found", { status: 404 })
    }

    // Transform records to logs
    const logs = records.map(recordToLog)

    const blockNumber = records[0].chainBlockNumber

    // Set cache headers
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=8000",
    })

    return new Response(JSON.stringify({ blockNumber, logs }), {
      status: 200,
      headers,
    })
  } catch (e) {
    console.error("Error processing request:", e)
    return new Response("Internal server error", { status: 500 })
  }
}
