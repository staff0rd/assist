export function expandAncestors(
	collapsed: ReadonlySet<string>,
	filePath: string,
): ReadonlySet<string> {
	const ancestors = [...collapsed].filter((dir) =>
		filePath.startsWith(`${dir}/`),
	);
	if (ancestors.length === 0) return collapsed;

	const next = new Set(collapsed);
	for (const dir of ancestors) next.delete(dir);
	return next;
}
