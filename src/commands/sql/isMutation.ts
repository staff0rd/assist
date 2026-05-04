const MUTATION_KEYWORDS = [
	"INSERT",
	"UPDATE",
	"DELETE",
	"DROP",
	"CREATE",
	"ALTER",
	"TRUNCATE",
	"MERGE",
	"GRANT",
	"REVOKE",
	"EXEC",
	"EXECUTE",
];

const MUTATION_PATTERN = new RegExp(
	`\\b(${MUTATION_KEYWORDS.join("|")})\\b`,
	"i",
);

function stripComments(sql: string): string {
	return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
}

export function isMutation(sql: string): boolean {
	const stripped = stripComments(sql);
	if (MUTATION_PATTERN.test(stripped)) return true;
	// SELECT ... INTO new_table creates a table
	return /\bSELECT\b[\s\S]+\bINTO\s+\w/i.test(stripped);
}
