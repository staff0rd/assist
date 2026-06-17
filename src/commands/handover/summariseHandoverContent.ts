const MAX_LENGTH = 100;

/**
 * Derive a one-line summary from a migrated disk handover's content: the first
 * meaningful body line, stripped of markdown heading/bullet markers and capped.
 * Falls back to a generic label when the note has no usable text.
 */
export function summariseHandoverContent(content: string): string {
	for (const raw of content.split("\n")) {
		const trimmed = raw.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const line = trimmed.replace(/^[>\-*\s]+/, "").trim();
		if (!line) continue;
		return line.length > MAX_LENGTH
			? `${line.slice(0, MAX_LENGTH - 1)}…`
			: line;
	}
	return "Migrated handover";
}
