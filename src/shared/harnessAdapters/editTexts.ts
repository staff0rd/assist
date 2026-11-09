export function editTexts(
	input: Record<string, unknown>,
	...fields: string[]
): string[] {
	if (!Array.isArray(input.edits)) return [];
	return (input.edits as unknown[]).flatMap((edit) => {
		const record = (edit ?? {}) as Record<string, unknown>;
		const text = fields
			.map((field) => record[field])
			.find((value): value is string => typeof value === "string");
		return text === undefined ? [] : [text];
	});
}
