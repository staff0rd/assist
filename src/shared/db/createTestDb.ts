import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { Db } from "./Db";
import { applyMigrations } from "./migrations/applyMigrations";
import { pgliteExecutor } from "./migrations/MigrationExecutor";
import { schema } from "./schema";

type SharedTestDb = { lite: PGlite; orm: Db };

type SharedTestDbHolder = Record<symbol, SharedTestDb | undefined>;

const SHARED_TEST_DB_KEY = Symbol.for("assist.sharedTestDb");

function sharedTestDb(): SharedTestDb {
	const holder = globalThis as SharedTestDbHolder;
	let shared = holder[SHARED_TEST_DB_KEY];
	if (!shared) {
		const lite = new PGlite();
		const orm = drizzlePglite(lite, { schema }) as unknown as Db;
		shared = { lite, orm };
		holder[SHARED_TEST_DB_KEY] = shared;
	}
	return shared;
}

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
	const { lite, orm } = sharedTestDb();
	await lite.exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
	await applyMigrations(pgliteExecutor(lite));
	return { orm, close: async () => {} };
}
