import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { Db } from "./Db";
import { applyMigrations } from "./migrations/applyMigrations";
import { pgliteExecutor } from "./migrations/MigrationExecutor";
import { schema } from "./schema";

/**
 * Create an in-process Postgres-backed {@link Db} for tests, using PGlite
 * (real Postgres compiled to WASM) so SQL is validated against the production
 * dialect without requiring an external database. The Drizzle client is
 * structurally identical to the production node-postgres client for query
 * building, so it is cast to that type.
 */
export async function createTestDb(): Promise<{
	orm: Db;
	close: () => Promise<void>;
}> {
	const lite = new PGlite();
	const orm = drizzlePglite(lite, {
		schema,
	}) as unknown as Db;
	await applyMigrations(pgliteExecutor(lite));
	return { orm, close: () => lite.close() };
}
