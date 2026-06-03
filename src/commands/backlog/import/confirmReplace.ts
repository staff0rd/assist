import chalk from "chalk";
import type { PoolClient } from "pg";
import { promptConfirm } from "../../../shared/promptConfirm";
import { DUMP_TABLES } from "../dump/DumpTable";

/** Current row count for one table. */
async function countRows(client: PoolClient, table: string): Promise<number> {
	const { rows } = await client.query(
		`SELECT count(*)::int AS n FROM ${table}`,
	);
	return rows[0].n as number;
}

/** Summarise the row-count changes the restore would make, one line per table. */
function printSummary(current: number[], incoming: number[]): void {
	const lines = DUMP_TABLES.map(
		(t, i) => `  ${t.name}: ${current[i]} → ${incoming[i]} rows`,
	);
	console.error(chalk.bold("\nThis will REPLACE all backlog data:"));
	console.error(`${lines.join("\n")}\n`);
}

/**
 * Confirm a destructive restore, summarising current vs incoming row counts.
 * Reading the dump from stdin consumes it, leaving nothing to prompt on, so that
 * path requires `--yes` and throws here otherwise.
 */
export async function confirmReplace(
	client: PoolClient,
	incoming: number[],
	fromStdin: boolean,
): Promise<boolean> {
	if (fromStdin) {
		throw new Error(
			"Reading a dump from stdin requires --yes (stdin is consumed by the dump).",
		);
	}
	const current = await Promise.all(
		DUMP_TABLES.map((t) => countRows(client, t.name)),
	);
	printSummary(current, incoming);
	return promptConfirm("Replace all backlog data with this dump?", false);
}
