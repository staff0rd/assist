export function removeIds(set: Set<string>, ids: string[]): Set<string> {
	if (!ids.some((id) => set.has(id))) return set;
	const next = new Set(set);
	for (const id of ids) next.delete(id);
	return next;
}
