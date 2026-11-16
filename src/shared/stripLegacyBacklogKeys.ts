/** Drop the retired backlog.previewComments key; undefined when nothing else is left. */
export function stripLegacyBacklogKeys(backlog: unknown): unknown {
	if (typeof backlog !== "object" || backlog === null) return backlog;
	const { previewComments: _previewComments, ...rest } = backlog as Record<
		string,
		unknown
	>;
	return Object.keys(rest).length > 0 ? rest : undefined;
}
