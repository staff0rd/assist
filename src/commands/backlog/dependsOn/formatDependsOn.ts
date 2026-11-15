/** "phase 2", "phases 1, 3" or "none" for a 1-based dependency list. */
export function formatDependsOn(dependsOn: readonly number[]): string {
	if (dependsOn.length === 0) return "none";
	const noun = dependsOn.length === 1 ? "phase" : "phases";
	return `${noun} ${dependsOn.join(", ")}`;
}
