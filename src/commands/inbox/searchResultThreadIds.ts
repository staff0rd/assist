function items(value: unknown): Record<string, unknown>[] {
	return Array.isArray(value) ? value : [];
}

function resultText(content: unknown): string {
	if (typeof content === "string") return content;
	return items(content)
		.map((block) => (typeof block.text === "string" ? block.text : ""))
		.join("");
}

export function searchResultThreadIds(content: unknown): string[] {
	try {
		const { threads } = JSON.parse(resultText(content)) as {
			threads?: unknown;
		};
		return items(threads)
			.map((thread) => thread.id)
			.filter((id): id is string => typeof id === "string");
	} catch {
		return [];
	}
}
