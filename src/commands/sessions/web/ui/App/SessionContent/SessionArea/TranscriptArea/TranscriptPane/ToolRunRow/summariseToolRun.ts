export function summariseToolRun(calls: { tool: string }[]): string {
	const counts = new Map<string, number>();
	for (const { tool } of calls) counts.set(tool, (counts.get(tool) ?? 0) + 1);
	const tools = [...counts]
		.map(([tool, n]) => (n > 1 ? `${tool} ×${n}` : tool))
		.join(", ");
	const noun = calls.length === 1 ? "tool call" : "tool calls";
	return `${calls.length} ${noun} · ${tools}`;
}
