import type { LineBoundFinding } from "./partitionFindings";

function isWithinDiff(
	finding: LineBoundFinding,
	index: Map<string, Set<number>>,
): boolean {
	const lines = index.get(finding.file);
	if (!lines) return false;
	if (!lines.has(finding.line)) return false;
	if (finding.startLine !== undefined && !lines.has(finding.startLine)) {
		return false;
	}
	return true;
}

export function partitionFindingsByDiff(
	findings: LineBoundFinding[],
	index: Map<string, Set<number>>,
): { inDiff: LineBoundFinding[]; outOfDiff: LineBoundFinding[] } {
	const inDiff: LineBoundFinding[] = [];
	const outOfDiff: LineBoundFinding[] = [];
	for (const finding of findings) {
		if (isWithinDiff(finding, index)) inDiff.push(finding);
		else outOfDiff.push(finding);
	}
	return { inDiff, outOfDiff };
}
