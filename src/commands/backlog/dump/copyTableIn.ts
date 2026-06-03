import { finished } from "node:stream/promises";
import type { PoolClient } from "pg";
import { from as copyFrom } from "pg-copy-streams";
import type { DumpTable } from "./DumpTable";

/**
 * Load a table's rows back via `COPY ... FROM STDIN` (default text format),
 * writing the verbatim payload captured at export time. Columns are listed
 * explicitly so the data lines up with the dumped order, preserving original
 * ids and origins. Resolves once Postgres has consumed the whole payload.
 */
export async function copyTableIn(
	client: PoolClient,
	table: DumpTable,
	data: Buffer,
): Promise<void> {
	const sql = `COPY ${table.name} (${table.columns.join(", ")}) FROM STDIN`;
	const stream = client.query(copyFrom(sql));
	stream.end(data);
	await finished(stream);
}
