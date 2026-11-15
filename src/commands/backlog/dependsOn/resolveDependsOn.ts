/** The 0-based phases a phase at `idx` waits for: its own list, or the previous phase. */
export function resolveDependsOn(
	dependsOn: readonly number[] | null | undefined,
	idx: number,
): number[] {
	if (dependsOn) return [...dependsOn];
	return idx > 0 ? [idx - 1] : [];
}
