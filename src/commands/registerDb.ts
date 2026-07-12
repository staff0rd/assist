import type { Command } from "commander";
import { createPool } from "../shared/db/getDb";
import { applyMigrations } from "../shared/db/migrations/applyMigrations";
import { getMigrationStatus } from "../shared/db/migrations/getMigrationStatus";
import { latestMigrationId } from "../shared/db/migrations/index";
import { pgExecutor } from "../shared/db/migrations/MigrationExecutor";
import {
	reportApplied,
	reportMigrationStatus,
} from "./db/reportMigrationStatus";

async function withPool(
	fn: (exec: ReturnType<typeof pgExecutor>) => Promise<void>,
): Promise<void> {
	const pool = createPool();
	try {
		await fn(pgExecutor(pool));
	} finally {
		await pool.end();
	}
}

async function migrate(): Promise<void> {
	await withPool(async (exec) => reportApplied(await applyMigrations(exec)));
}

async function status(): Promise<void> {
	await withPool(async (exec) =>
		reportMigrationStatus(await getMigrationStatus(exec)),
	);
}

export function registerDb(program: Command): void {
	const db = program
		.command("db")
		.description("Inspect and apply the backlog database migrations");

	db.command("migrate")
		.description(
			`Apply pending migrations in order (build ships up to migration ${latestMigrationId})`,
		)
		.action(migrate);

	db.command("status")
		.description(
			"Report whether the database is in sync, behind, or ahead of this build",
		)
		.action(status);
}
