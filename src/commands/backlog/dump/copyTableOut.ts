import type { PoolClient } from "pg";
import { to as copyTo } from "pg-copy-streams";
import type { DumpTable } from "./DumpTable";

/**
 * Stream a table's rows out via `COPY ... TO STDOUT` (default text format) and
 * collect them into a single buffer. Columns are listed explicitly so the data
 * order is stable and matches what import COPYs back in.
 */
export async function copyTableOut(
	client: PoolClient,
	table: DumpTable,
): Promise<Buffer> {
	const sql = `COPY ${table.name} (${table.columns.join(", ")}) TO STDOUT`;
	const stream = client.query(copyTo(sql));
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
}
