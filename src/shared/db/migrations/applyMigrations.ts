import { migrations } from "./index";
import type { MigrationExecutor } from "./MigrationExecutor";

export const APPLIED_MIGRATIONS_TABLE = "applied_migrations";

const CREATE_APPLIED_MIGRATIONS = `
	CREATE TABLE IF NOT EXISTS ${APPLIED_MIGRATIONS_TABLE} (
		id INTEGER PRIMARY KEY,
		name TEXT NOT NULL,
		applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
	);
`;

export type AppliedMigration = { id: number; name: string };

async function readAppliedIds(exec: MigrationExecutor): Promise<Set<number>> {
	const rows = await exec.query(
		`SELECT id FROM ${APPLIED_MIGRATIONS_TABLE} ORDER BY id`,
	);
	return new Set(rows.map((row) => Number(row.id)));
}

export async function applyMigrations(
	exec: MigrationExecutor,
): Promise<AppliedMigration[]> {
	await exec.exec(CREATE_APPLIED_MIGRATIONS);
	const applied = await readAppliedIds(exec);
	const newlyApplied: AppliedMigration[] = [];
	for (const migration of migrations) {
		if (applied.has(migration.id)) continue;
		await exec.exec(migration.sql);
		await exec.query(
			`INSERT INTO ${APPLIED_MIGRATIONS_TABLE} (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
			[migration.id, migration.name],
		);
		newlyApplied.push({ id: migration.id, name: migration.name });
	}
	return newlyApplied;
}
