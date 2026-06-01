import type { Pool } from "pg";

/**
 * Minimal async database surface used by the backlog data layer. Implemented on
 * top of a Postgres connection (a pg {@link Pool} in production, an embedded
 * PGlite instance in tests). SQL is written with `?` placeholders and rewritten
 * to Postgres `$n` positional parameters by {@link toPg}.
 */
export type BacklogDb = {
	all<T = Record<string, unknown>>(
		sql: string,
		params?: unknown[],
	): Promise<T[]>;
	get<T = Record<string, unknown>>(
		sql: string,
		params?: unknown[],
	): Promise<T | undefined>;
	run(sql: string, params?: unknown[]): Promise<{ changes: number }>;
	exec(sql: string): Promise<void>;
	transaction<T>(fn: (tx: BacklogDb) => Promise<T>): Promise<T>;
};

type QueryResult = {
	rows: Record<string, unknown>[];
	rowCount?: number | null;
	affectedRows?: number;
};

/** A thing we can run a parameterised query against (pg Pool/Client or PGlite). */
type Queryable = {
	query(sql: string, params?: unknown[]): Promise<QueryResult>;
	/** Optional multi-statement runner (PGlite needs this; pg handles it via query). */
	exec?(sql: string): Promise<unknown>;
};

function toPg(sql: string): string {
	let i = 0;
	return sql.replace(/\?/g, () => `$${++i}`);
}

class PgBacklogDb implements BacklogDb {
	constructor(
		private readonly queryable: Queryable,
		private readonly pool?: Pool,
	) {}

	async all<T = Record<string, unknown>>(
		sql: string,
		params: unknown[] = [],
	): Promise<T[]> {
		const result = await this.queryable.query(toPg(sql), params);
		return result.rows as T[];
	}

	async get<T = Record<string, unknown>>(
		sql: string,
		params: unknown[] = [],
	): Promise<T | undefined> {
		const result = await this.queryable.query(toPg(sql), params);
		return result.rows[0] as T | undefined;
	}

	async run(sql: string, params: unknown[] = []): Promise<{ changes: number }> {
		const result = await this.queryable.query(toPg(sql), params);
		return { changes: result.rowCount ?? result.affectedRows ?? 0 };
	}

	async exec(sql: string): Promise<void> {
		if (this.queryable.exec) {
			await this.queryable.exec(sql);
		} else {
			await this.queryable.query(sql);
		}
	}

	async transaction<T>(fn: (tx: BacklogDb) => Promise<T>): Promise<T> {
		// On a pool, check out a dedicated client so the whole transaction runs on
		// one connection; on a single-connection backend (PGlite), run it inline.
		const client = this.pool ? await this.pool.connect() : undefined;
		const tx: PgBacklogDb = client
			? new PgBacklogDb({
					query: (sql, params) => client.query(sql, params as unknown[]),
				})
			: this;
		try {
			return await tx.atomic(fn);
		} finally {
			client?.release();
		}
	}

	private async atomic<T>(fn: (tx: BacklogDb) => Promise<T>): Promise<T> {
		await this.queryable.query("BEGIN");
		try {
			const result = await fn(this);
			await this.queryable.query("COMMIT");
			return result;
		} catch (error) {
			await this.queryable.query("ROLLBACK");
			throw error;
		}
	}
}

/** Wrap a pg Pool (or any {@link Queryable}) as a {@link BacklogDb}. */
export function makeBacklogDb(queryable: Queryable, pool?: Pool): BacklogDb {
	return new PgBacklogDb(queryable, pool);
}
