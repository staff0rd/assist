function items(value: unknown): Record<string, unknown>[] {
	return Array.isArray(value) ? value : [];
}

export function searchResultThreadIds(text: string): string[] {
	try {
		const { threads } = JSON.parse(text) as { threads?: unknown };
		return items(threads)
			.map((thread) => thread.id)
			.filter((id): id is string => typeof id === "string");
	} catch {
		return [];
	}
}
