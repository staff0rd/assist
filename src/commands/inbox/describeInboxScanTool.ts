function pick(input: Record<string, unknown>, keys: string[]): string[] {
	return keys
		.map((key) => input[key])
		.filter(
			(value): value is string | number =>
				typeof value === "string" || typeof value === "number",
		)
		.map(String);
}

function toolLabel(name: string): string {
	const match = name.match(/^mcp__claude_ai_([^_]+)__(?:slack_)?(.+)$/);
	return match ? `${match[1]} ${match[2]}` : name;
}

export function describeInboxScanTool(
	name: string,
	input: unknown,
): { label: string; detail: string } {
	const record =
		input && typeof input === "object"
			? (input as Record<string, unknown>)
			: {};
	const detail = pick(record, [
		"query",
		"thread_id",
		"threadId",
		"channel_id",
		"message_ts",
	]).join(" ");
	return { label: toolLabel(name), detail };
}
