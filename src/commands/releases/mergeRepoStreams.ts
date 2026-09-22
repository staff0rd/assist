function repoOf(stream: Record<string, unknown>): string {
	return typeof stream.repo === "string" ? stream.repo.toLowerCase() : "";
}

export function mergeRepoStreams(
	declared: Record<string, unknown>[],
	incoming: Record<string, unknown>[],
): Record<string, unknown>[] {
	const replaced = new Set(incoming.map(repoOf));
	return [
		...declared.filter((stream) => !replaced.has(repoOf(stream))),
		...incoming,
	];
}
