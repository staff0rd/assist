import type { PoolClient } from "pg";
import { applyMigrations } from "../../../shared/db/migrations/applyMigrations";
import { pgExecutor } from "../../../shared/db/migrations/MigrationExecutor";
import { copyTableIn } from "../dump/copyTableIn";
import { backfillItemPriority } from "./backfillItemPriority";
import {
	introspectSequenceColumns,
	resyncSequenceSql,
} from "../dump/introspectSequenceColumns";
import type { ParsedDump } from "../dump/parseDump";

/** Replace all data with the dump's rows in FK order, then resync identity sequences. */
async function replaceData(
	client: PoolClient,
	parsed: ParsedDump,
): Promise<void> {
	const { tables } = parsed.header;
	const tableList = tables.map((t) => t.name).join(", ");
	await applyMigrations(pgExecutor(client));
	await client.query(`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`);
	for (const table of tables) {
		const data = parsed.sections.get(table.name) ?? Buffer.alloc(0);
		await copyTableIn(client, table, data);
	}
	await backfillItemPriority(client, tables);
	for (const col of await introspectSequenceColumns(client)) {
		const { text, values } = resyncSequenceSql(col);
		await client.query(text, values);
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
