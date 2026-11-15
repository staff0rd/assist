/** Sort and dedupe 0-based dependencies, returning null when they equal the default (previous phase). */
export function normalizeDependsOn(
	dependsOn: readonly number[] | null | undefined,
	idx: number,
): number[] | null {
	if (!dependsOn) return null;
	const sorted = [...new Set(dependsOn)].sort((a, b) => a - b);
	const isDefault =
		idx === 0
			? sorted.length === 0
			: sorted.length === 1 && sorted[0] === idx - 1;
	return isDefault ? null : sorted;
}
