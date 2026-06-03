import type { PoolClient } from "pg";
import { copyTableIn } from "../dump/copyTableIn";
import { DUMP_TABLES } from "../dump/DumpTable";
import type { ParsedDump } from "../dump/parseDump";
import { SCHEMA } from "../ensureSchema";

/** Tables with a generated identity whose sequence must be resynced after restore. */
const IDENTITY_TABLES = ["items", "comments"] as const;

/** Advance a table's identity sequence past its largest restored id (reset when empty). */
function resyncIdentitySql(table: string): string {
	return `SELECT setval(pg_get_serial_sequence('${table}', 'id'),
		GREATEST(COALESCE((SELECT max(id) FROM ${table}), 0), 1),
		(SELECT count(*) FROM ${table}) > 0)`;
}

/** Replace all data with the dump's rows in FK order, then resync identity sequences. */
async function replaceData(
	client: PoolClient,
	parsed: ParsedDump,
): Promise<void> {
	const tables = DUMP_TABLES.map((t) => t.name).join(", ");
	await client.query(SCHEMA);
	await client.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
	for (const table of DUMP_TABLES) {
		const data = parsed.sections.get(table.name) ?? Buffer.alloc(0);
		await copyTableIn(client, table, data);
	}
	for (const table of IDENTITY_TABLES) {
		await client.query(resyncIdentitySql(table));
	}
}

/** Run {@link replaceData} in one transaction; roll back (data intact) on any error. */
export async function restore(
	client: PoolClient,
	parsed: ParsedDump,
): Promise<void> {
	await client.query("BEGIN");
	try {
		await replaceData(client, parsed);
		await client.query("COMMIT");
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	}
}
