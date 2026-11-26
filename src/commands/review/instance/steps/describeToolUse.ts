export function describeToolUse(name: string, input: unknown): string {
	const tool = name.replace(/^mcp__[^_]+__/, "");
	const args = Object.values((input ?? {}) as Record<string, unknown>)
		.map((value) => (typeof value === "string" ? value : JSON.stringify(value)))
		.join(" ");
	const line = args ? `${tool} ${args}` : tool;
	return line.length > 120 ? `${line.slice(0, 119)}…` : line;
}
