export function claudeContentBlocksOf(
	content: unknown,
): Record<string, unknown>[] {
	return Array.isArray(content)
		? content.filter(
				(b): b is Record<string, unknown> => !!b && typeof b === "object",
			)
		: [];
}
