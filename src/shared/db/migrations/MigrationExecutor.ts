export type MigrationExecutor = {
	exec: (sql: string) => Promise<unknown>;
	query: (
		sql: string,
		params?: unknown[],
	) => Promise<Record<string, unknown>[]>;
};

type PgQueryable = {
	query: (
		text: string,
		values?: unknown[],
	) => Promise<{ rows: Record<string, unknown>[] }>;
};

type PgliteQueryable = {
	exec: (sql: string) => Promise<unknown>;
	query: (
		sql: string,
		params?: unknown[],
	) => Promise<{ rows: Record<string, unknown>[] }>;
};

export function pgExecutor(queryable: PgQueryable): MigrationExecutor {
	return {
		exec: (sql) => queryable.query(sql),
		query: async (sql, params) => (await queryable.query(sql, params)).rows,
	};
}

export function pgliteExecutor(lite: PgliteQueryable): MigrationExecutor {
	return {
		exec: (sql) => lite.exec(sql),
		query: async (sql, params) => (await lite.query(sql, params)).rows,
	};
}
