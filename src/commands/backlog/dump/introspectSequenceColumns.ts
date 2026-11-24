/** Minimal shape of a pg `PoolClient` / PGlite instance: a `query` returning rows. */
type Queryable = {
	query: (sql: string) => Promise<{ rows: Record<string, unknown>[] }>;
};

type SequenceColumn = {
	/** quote_ident-quoted table, safe to interpolate into SQL. */
	table: string;
	/** quote_ident-quoted column, safe to interpolate into max(). */
	column: string;
	/** Raw column name, passed as text to pg_get_serial_sequence. */
	rawColumn: string;
};

const SEQUENCE_SQL = `
	SELECT
		quote_ident(table_name) AS table,
		quote_ident(column_name) AS column,
		column_name AS raw_column
	FROM information_schema.columns
	WHERE table_schema = 'public'
		AND (is_identity = 'YES' OR column_default LIKE 'nextval(%')
	ORDER BY table_name, ordinal_position
`;

/**
 * Discover every identity or sequence-defaulted column by introspection rather than a hardcoded list,
 * so a table added to the schema (or created at runtime) has its sequence
 * resynced on restore with no source change.
 */
export async function introspectSequenceColumns(
	client: Queryable,
): Promise<SequenceColumn[]> {
	const { rows } = await client.query(SEQUENCE_SQL);
	return rows.map((row) => ({
		table: row.table as string,
		column: row.column as string,
		rawColumn: row.raw_column as string,
	}));
}

/**
 * SQL (with bind values) that advances a column's backing sequence past the
 * largest restored value, resetting to 1 when the table is empty. The column is
 * passed to pg_get_serial_sequence as a bind value so reserved-word names such
 * as usage_peaks."window" need no escaping.
 */
export function resyncSequenceSql(col: SequenceColumn): {
	text: string;
	values: string[];
} {
	return {
		text: `SELECT setval(
			pg_get_serial_sequence($1, $2),
			GREATEST(COALESCE((SELECT max(${col.column}) FROM ${col.table}), 0), 1),
			(SELECT count(*) FROM ${col.table}) > 0)`,
		values: [col.table, col.rawColumn],
	};
}
