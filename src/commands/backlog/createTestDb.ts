import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { BacklogOrm } from "./BacklogOrm";
import { backlogSchema } from "./backlogSchema";
import { ensureSchema } from "./ensureSchema";

/**
 * Create an in-process Postgres-backed {@link BacklogOrm} for tests, using PGlite
 * (real Postgres compiled to WASM) so SQL is validated against the production
 * dialect without requiring an external database. The Drizzle client is
 * structurally identical to the production node-postgres client for query
 * building, so it is cast to that type.
 */
export async function createTestDb(): Promise<{
	orm: BacklogOrm;
	close: () => Promise<void>;
}> {
	const lite = new PGlite();
	const orm = drizzlePglite(lite, {
		schema: backlogSchema,
	}) as unknown as BacklogOrm;
	await ensureSchema((sql) => lite.exec(sql));
	return { orm, close: () => lite.close() };
}
