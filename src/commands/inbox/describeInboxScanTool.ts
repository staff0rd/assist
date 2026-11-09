function pick(input: Record<string, unknown>, keys: string[]): string[] {
	return keys
		.map((key) => input[key])
		.filter(
			(value): value is string | number =>
				typeof value === "string" || typeof value === "number",
		)
		.map(String);
}

export function describeInboxScanTool(input: Record<string, unknown>): string {
	return pick(input, [
		"query",
		"thread_id",
		"threadId",
		"channel_id",
		"message_ts",
	]).join(" ");
}
