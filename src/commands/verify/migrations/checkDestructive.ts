export const DESTRUCTIVE_ACK_MARKER = "destructive-ok";

const DESTRUCTIVE_PATTERNS: { label: string; regex: RegExp }[] = [
	{ label: "DROP TABLE", regex: /\bDROP\s+TABLE\b/i },
	{ label: "DROP COLUMN", regex: /\bDROP\s+COLUMN\b/i },
	{ label: "RENAME COLUMN", regex: /\bRENAME\s+COLUMN\b/i },
];

const MARKER = /--\s*destructive-ok\b/i;

type DestructiveFinding = {
	id: number;
	name: string;
	statements: string[];
};

export function checkDestructive(
	migrations: readonly { id: number; name: string; sql: string }[],
): DestructiveFinding[] {
	const findings: DestructiveFinding[] = [];
	for (const migration of migrations) {
		const statements = DESTRUCTIVE_PATTERNS.filter((pattern) =>
			pattern.regex.test(migration.sql),
		).map((pattern) => pattern.label);
		if (statements.length === 0) continue;
		if (MARKER.test(migration.sql)) continue;
		findings.push({ id: migration.id, name: migration.name, statements });
	}
	return findings;
}
