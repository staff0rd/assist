/**
 * Translates a Seq filter expression into a SQL WHERE clause.
 * - Converts == to = (Seq SQL uses single =)
 * - Converts double-quoted strings to single-quoted
 */
export function filterToSql(filter: string): string {
	return filter.replace(/==/g, "=").replace(/"([^"]*)"/g, "'$1'");
}
