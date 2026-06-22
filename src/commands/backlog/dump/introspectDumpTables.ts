import type { DumpTable } from "./DumpTable";
import { type ColumnRow, type FkRow, orderDumpTables } from "./orderDumpTables";

/** Minimal shape of a pg `PoolClient` / PGlite instance: a `query` returning rows. */
type Queryable = {
	query: (sql: string) => Promise<{ rows: Record<string, unknown>[] }>;
};

/**
 * Every base table in the public schema with its columns in ordinal order, each
 * identifier pre-quoted via `quote_ident` so reserved words survive verbatim.
 */
const COLUMNS_SQL = `
	SELECT
		c.table_name AS table_name,
		quote_ident(c.table_name) AS quoted_table,
		quote_ident(c.column_name) AS quoted_column
	FROM information_schema.columns c
	JOIN information_schema.tables t
		ON t.table_schema = c.table_schema
		AND t.table_name = c.table_name
	WHERE c.table_schema = 'public'
		AND t.table_type = 'BASE TABLE'
	ORDER BY c.table_name, c.ordinal_position
`;

/** Foreign-key edges (child references parent) among public base tables, self-refs excluded. */
const FK_SQL = `
	SELECT child.relname AS child, parent.relname AS parent
	FROM pg_constraint con
	JOIN pg_class child ON child.oid = con.conrelid
	JOIN pg_class parent ON parent.oid = con.confrelid
	JOIN pg_namespace n ON n.oid = con.connamespace
	WHERE con.contype = 'f'
		AND n.nspname = 'public'
		AND con.conrelid <> con.confrelid
`;

/**
 * Discover the live database's dumpable tables by introspection rather than a
 * hardcoded list: every base table, its columns in ordinal order, with all
 * identifiers quoted, returned in foreign-key-safe order so the same sequence
 * COPYs rows back in without deferring constraints.
 */
export async function introspectDumpTables(
	client: Queryable,
): Promise<DumpTable[]> {
	const [{ rows: columnRows }, { rows: fkRows }] = await Promise.all([
		client.query(COLUMNS_SQL),
		client.query(FK_SQL),
	]);
	return orderDumpTables(columnRows as ColumnRow[], fkRows as FkRow[]);
}
