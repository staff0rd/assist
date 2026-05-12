export function formatToolText(
	name: string,
	tool: string,
	summary: string,
): string {
	const suffix = summary ? `: ${summary}` : "";
	return `${name} — ${tool}${suffix}`;
}
