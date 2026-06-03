import chalk from "chalk";
import { Pool, type PoolClient } from "pg";
import { loadConfig } from "../../shared/loadConfig";
import { type BacklogOrm, makeOrmFromPool } from "./BacklogOrm";
import { ensureSchema } from "./ensureSchema";

const DATABASE_URL_ENV = "ASSIST_BACKLOG_DATABASE_URL";

const MISSING_URL_MESSAGE = `No backlog database configured.

Backlog storage requires a Postgres-compatible connection string. Set one via either:
  • the ${DATABASE_URL_ENV} environment variable, or
  • backlog.databaseUrl in ~/.assist.yml

Example:
  backlog:
    databaseUrl: postgresql://user:password@host:5432/database

Managed Postgres providers such as Supabase or Neon work out of the box.`;

/**
 * Resolve the backlog database connection string. The env var takes precedence
 * over config. Prints a helpful message and exits if neither is set.
 */
function getDatabaseUrl(): string {
	const url = process.env[DATABASE_URL_ENV] ?? loadConfig().backlog.databaseUrl;
	if (!url) {
		console.error(chalk.red(MISSING_URL_MESSAGE));
		process.exit(1);
	}
	return url;
}

let _connecting: Promise<BacklogOrm> | undefined;
let _pool: Pool | undefined;
let _orm: BacklogOrm | undefined;

/**
 * Connect to the configured Postgres database on demand, creating the schema on
 * first connect and returning the Drizzle client used throughout the backlog
 * data layer. The connection is cached for the lifetime of the process.
 */
export function getBacklogOrm(): Promise<BacklogOrm> {
	if (_orm) return Promise.resolve(_orm);
	if (_connecting) return _connecting;
	_connecting = (async () => {
		const pool = new Pool({ connectionString: getDatabaseUrl() });
		_pool = pool;
		await ensureSchema((sql) => pool.query(sql));
		_orm = makeOrmFromPool(pool);
		return _orm;
	})();
	return _connecting;
}

/**
 * Check out a dedicated pooled client and run {@link fn} against it, releasing
 * the client afterwards. Connecting first ensures the schema exists. Used for
 * COPY streaming, which needs a raw pg client rather than the Drizzle query
 * surface. Throws when the backend is not a pg pool (e.g. PGlite in tests).
 */
export async function withBacklogClient<T>(
	fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
	await getBacklogOrm();
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
export async function closeBacklogDb(): Promise<void> {
	const pool = _pool;
	if (!pool) return;
	_pool = undefined;
	_orm = undefined;
	_connecting = undefined;
	await pool.end();
}
