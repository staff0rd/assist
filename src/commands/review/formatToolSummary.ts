function truncate(value: string, max = 80): string {
	const collapsed = value.replace(/\s+/g, " ").trim();
	if (collapsed.length <= max) return collapsed;
	return `${collapsed.slice(0, max - 1)}…`;
}

function getString(input: Record<string, unknown>, key: string): string | null {
	const value = input[key];
	return typeof value === "string" ? value : null;
}

export function formatToolSummary(input: unknown): string {
	if (!input || typeof input !== "object") return "";
	const record = input as Record<string, unknown>;
	const pattern = getString(record, "pattern");
	if (pattern) {
		const scope = getString(record, "path");
		return scope ? `${pattern} in ${scope}` : pattern;
	}
	const filePath = getString(record, "file_path") ?? getString(record, "path");
	if (filePath) return filePath;
	const command = getString(record, "command");
	if (command) return truncate(command);
	const url = getString(record, "url");
	if (url) return url;
	const query = getString(record, "query");
	if (query) return truncate(query);
	const description = getString(record, "description");
	if (description) return truncate(description);
	return "";
}

export function simplifyShellCommand(command: string): string {
	const wrapped = command.match(/^\/bin\/bash\s+-lc\s+"(.*)"\s*$/s);
	const inner = wrapped ? wrapped[1].replace(/\\"/g, '"') : command;
	return truncate(inner);
}
