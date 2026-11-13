import type { Pool, PoolClient } from "pg";
import { createPool } from "./createPool";
import type { Db } from "./Db";
import { initDb } from "./initDb";
import { loadedDb } from "./loadedDb";

let _connecting: Promise<Db> | undefined;
let _pool: Pool | undefined;
let _orm: Db | undefined;

/**
 * Connect to the configured Postgres database on demand, returning the Drizzle
 * client used throughout the backlog data layer. The connection is cached for
 * the lifetime of the process.
 */
function discardPool(): void {
	void _pool?.end().catch(() => {});
	_connecting = undefined;
	_pool = undefined;
}

export function getDb(): Promise<Db> {
	if (_orm) return Promise.resolve(_orm);
	if (_connecting) return _connecting;
	try {
		_pool = createPool();
		loadedDb.close = closeDb;
	} catch (error) {
		return Promise.reject(error);
	}
	_connecting = initDb(_pool);
	void _connecting.then((orm) => (_orm = orm)).catch(discardPool);
	return _connecting;
}

/**
 * Check out a dedicated pooled client and run {@link fn} against it, releasing
 * the client afterwards. Connecting first ensures the schema exists. Used for
 * COPY streaming, which needs a raw pg client rather than the Drizzle query
 * surface. Throws when the backend is not a pg pool (e.g. PGlite in tests).
 */
export async function withDbClient<T>(
	fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
	await getDb();
	const pool = _pool;
	if (!pool) {
		throw new Error("COPY streaming requires a pooled Postgres connection.");
	}
	const client = await pool.connect();
	try {
		return await fn(client);
	} finally {
		client.release();
	}
}

/**
 * Close the cached Postgres pool, if one was opened. The pool's idle connections
 * and timers keep the Node event loop alive, so commands hang after printing
 * unless the pool is drained. Safe to call when no pool was ever created.
 */
export async function closeDb(): Promise<void> {
	const pool = _pool;
	if (!pool) return;
	_pool = undefined;
	_orm = undefined;
	_connecting = undefined;
	await pool.end();
}
