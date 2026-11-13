import type { Pool } from "pg";
import { seedNewsFeeds } from "../../commands/backlog/seedNewsFeeds";
import { cleanupFalseResetSegments } from "./cleanupFalseResetSegments";
import { toDatabaseConnectionError } from "./DatabaseConnectionError";
import { type Db, makeOrmFromPool } from "./Db";
import { assertMigrationsInSync } from "./migrations/assertMigrationsInSync";
import { pgExecutor } from "./migrations/MigrationExecutor";

export async function initDb(pool: Pool): Promise<Db> {
	try {
		await assertMigrationsInSync(pgExecutor(pool));
	} catch (error) {
		throw toDatabaseConnectionError(error);
	}
	const orm = makeOrmFromPool(pool);
	await seedNewsFeeds(orm);
	await runUsagePeakCleanup(orm);
	return orm;
}

async function runUsagePeakCleanup(orm: Db): Promise<void> {
	try {
		await cleanupFalseResetSegments(orm);
	} catch (error) {
		// why: a one-off data fix must never block connecting, so swallow and log.
		console.error(
			`${new Date().toISOString()} usage-peaks cleanup failed: ${String(error)}`,
		);
	}
}
