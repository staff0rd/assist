import { APPLIED_MIGRATIONS_TABLE } from "./applyMigrations";
import { migrations } from "./index";
import type { MigrationExecutor } from "./MigrationExecutor";

export type MigrationStatus =
	| { state: "in-sync"; version: number }
	| { state: "behind"; applied: number; expected: number; pending: number[] }
	| { state: "ahead"; applied: number; expected: number };

const maxId = (ids: number[]): number =>
	ids.reduce((max, id) => Math.max(max, id), 0);

export function compareMigrations(appliedIds: number[]): MigrationStatus {
	const bundledIds = migrations.map((m) => m.id);
	const appliedSet = new Set(appliedIds);
	const bundledSet = new Set(bundledIds);
	const applied = maxId(appliedIds);
	const expected = maxId(bundledIds);
	const ahead = appliedIds.filter((id) => !bundledSet.has(id));
	if (ahead.length > 0) return { state: "ahead", applied, expected };
	const pending = bundledIds.filter((id) => !appliedSet.has(id));
	if (pending.length > 0)
		return { state: "behind", applied, expected, pending };
	return { state: "in-sync", version: expected };
}

async function readAppliedIds(exec: MigrationExecutor): Promise<number[]> {
	const present = await exec.query(
		`SELECT to_regclass('public.${APPLIED_MIGRATIONS_TABLE}') AS reg`,
	);
	if (!present[0]?.reg) return [];
	const rows = await exec.query(
		`SELECT id FROM ${APPLIED_MIGRATIONS_TABLE} ORDER BY id`,
	);
	return rows.map((row) => Number(row.id));
}

export async function getMigrationStatus(
	exec: MigrationExecutor,
): Promise<MigrationStatus> {
	return compareMigrations(await readAppliedIds(exec));
}
