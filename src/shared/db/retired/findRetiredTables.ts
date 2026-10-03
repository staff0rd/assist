import type { MigrationExecutor } from "../migrations/MigrationExecutor";

const RETIRED_TABLES = ["handovers"];

export type RetiredTable = { name: string; rows: number };

export async function findRetiredTables(
	exec: MigrationExecutor,
): Promise<RetiredTable[]> {
	const present = await exec.query(
		`SELECT table_name FROM information_schema.tables
		WHERE table_schema = current_schema() AND table_name = ANY($1)
		ORDER BY table_name`,
		[RETIRED_TABLES],
	);
	const found: RetiredTable[] = [];
	for (const row of present) {
		const name = String(row.table_name);
		const [count] = await exec.query(
			`SELECT count(*)::int AS rows FROM "${name}"`,
		);
		found.push({ name, rows: Number(count.rows) });
	}
	return found;
}
