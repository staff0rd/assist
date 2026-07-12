import chalk from "chalk";
import { Pool, type PoolClient } from "pg";
import { seedNewsFeeds } from "../../commands/backlog/seedNewsFeeds";
import { loadConfig } from "../loadConfig";
import { cleanupFalseResetSegments } from "./cleanupFalseResetSegments";
import { type Db, makeOrmFromPool } from "./Db";
import { assertMigrationsInSync } from "./migrations/assertMigrationsInSync";
import { pgExecutor } from "./migrations/MigrationExecutor";

const DATABASE_URL_ENV = "ASSIST_DATABASE_URL";

const MISSING_URL_MESSAGE = `No assist database configured.

Assist storage requires a Postgres-compatible connection string. Set one via either:
  • the ${DATABASE_URL_ENV} environment variable, or
  • database.url in ~/.assist.yml

Example:
  database:
    url: postgresql://user:password@host:5432/database

Managed Postgres providers such as Supabase or Neon work out of the box.`;

/**
 * Resolve the backlog database connection string. The env var takes precedence
 * over config. Prints a helpful message and exits if neither is set.
 */
function getDatabaseUrl(): string {
	const url = process.env[DATABASE_URL_ENV] ?? loadConfig().database.url;
	if (!url) {
		console.error(chalk.red(MISSING_URL_MESSAGE));
		process.exit(1);
	}
	return url;
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

// why: an unhandled 'error' from an idle client crashes the process; absorb it so the pool just reconnects.
function logPoolError(error: Error): void {
	console.error(
		`${new Date().toISOString()} backlog pool error: ${error.message}`,
	);
}

export function createPool(): Pool {
	const pool = new Pool({
		connectionString: getDatabaseUrl(),
		max: 10,
		// why: retire idle clients before managed Postgres (Supabase/Neon) drops them server-side, so we never check out a dead socket and stall on a timeout.
		idleTimeoutMillis: 30_000,
		// why: bound the wait for a free client so a degraded pool fails fast (500 + log line) rather than hanging for seconds.
		connectionTimeoutMillis: 10_000,
	});
	pool.on("error", logPoolError);
	return pool;
}

async function initDb(pool: Pool): Promise<Db> {
	await assertMigrationsInSync(pgExecutor(pool));
	const orm = makeOrmFromPool(pool);
	await seedNewsFeeds(orm);
	await runUsagePeakCleanup(orm);
	return orm;
}

let _connecting: Promise<Db> | undefined;
let _pool: Pool | undefined;
let _orm: Db | undefined;

/**
 * Connect to the configured Postgres database on demand, returning the Drizzle
 * client used throughout the backlog data layer. The connection is cached for
 * the lifetime of the process.
 */
export function getDb(): Promise<Db> {
	if (_orm) return Promise.resolve(_orm);
	if (_connecting) return _connecting;
	_connecting = (async () => {
		_pool = createPool();
		_orm = await initDb(_pool);
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
