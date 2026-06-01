import chalk from "chalk";
import { Pool } from "pg";
import { loadConfig } from "../../shared/loadConfig";
import { type BacklogDb, makeBacklogDb } from "./BacklogDb";
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

let _db: BacklogDb | undefined;
let _connecting: Promise<BacklogDb> | undefined;

/**
 * Connect to the configured Postgres database on demand, creating the schema on
 * first connect. The connection is cached for the lifetime of the process.
 */
export function getBacklogDb(): Promise<BacklogDb> {
	if (_db) return Promise.resolve(_db);
	if (_connecting) return _connecting;
	_connecting = (async () => {
		const pool = new Pool({ connectionString: getDatabaseUrl() });
		const db = makeBacklogDb(
			{ query: (sql, params) => pool.query(sql, params as unknown[]) },
			pool,
		);
		await ensureSchema(db);
		_db = db;
		return db;
	})();
	return _connecting;
}
