import type { ExtractTablesWithRelations } from "drizzle-orm";
import {
	drizzle as drizzleNodePg,
	type NodePgDatabase,
	type NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { Pool } from "pg";
import { backlogSchema } from "./backlogSchema";

/**
 * The Drizzle handle used throughout the backlog data layer. Typed against the
 * node-postgres driver; the PGlite-backed test client (see `createTestDb`) is
 * structurally identical for query building and is cast to this type.
 */
export type BacklogOrm = NodePgDatabase<typeof backlogSchema>;

/**
 * The transaction handle passed to an `orm.transaction(...)` callback. Structurally
 * a Postgres database for query building, so the same helpers work against it.
 */
type BacklogTx = PgTransaction<
	NodePgQueryResultHKT,
	typeof backlogSchema,
	ExtractTablesWithRelations<typeof backlogSchema>
>;

/**
 * Either the top-level client or a transaction. Helpers that run inside a
 * transaction (e.g. relation inserts, phase reindexing) accept this so they can
 * be called both standalone and within an `orm.transaction(...)` block.
 */
export type BacklogDatabase = BacklogOrm | BacklogTx;

/** Build a Drizzle client over a pg {@link Pool} (production). */
export function makeOrmFromPool(pool: Pool): BacklogOrm {
	return drizzleNodePg(pool, { schema: backlogSchema });
}
