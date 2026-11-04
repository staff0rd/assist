const SLICE_CHECKS: ReadonlySet<string> = new Set([
	"structure-sensible",
	"tests-worth-having",
	"critical-diffs-correct",
]);

export function isHighLevelSliceCheck(id: string): boolean {
	return SLICE_CHECKS.has(id);
}
