import { PGlite } from "@electric-sql/pglite";
import { type BacklogDb, makeBacklogDb } from "./BacklogDb";
import { ensureSchema } from "./ensureSchema";

/**
 * Create an in-process Postgres-backed {@link BacklogDb} for tests, using PGlite
 * (real Postgres compiled to WASM) so SQL is validated against the production
 * dialect without requiring an external database.
 */
export async function createTestDb(): Promise<{
	db: BacklogDb;
	close: () => Promise<void>;
}> {
	const lite = new PGlite();
	const db = makeBacklogDb({
		query: (sql, params) => lite.query(sql, params as unknown[]),
		exec: (sql) => lite.exec(sql),
	});
	await ensureSchema(db);
	return { db, close: () => lite.close() };
}
