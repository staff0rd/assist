import { highLevelChangedFileCount } from "../../../../../../../../review/highLevel/highLevelChangedFileCount";
import { highLevelTestCount } from "../../../../../../../../review/highLevel/highLevelTestCount";
import type { HighLevelPreviewPayload } from "../../../../../../../../review/highLevel/types";

export function highLevelJumpCounts(
	payload: HighLevelPreviewPayload,
): Record<string, string> {
	const counts: [string, number][] = [
		["structure-sensible", highLevelChangedFileCount(payload.structure)],
		["critical-diffs-correct", payload.criticalDiffs.length],
		["tests-worth-having", highLevelTestCount(payload.tests)],
		["manual-testing", payload.manualTesting?.steps.length ?? 0],
	];
	return Object.fromEntries(
		counts
			.filter(([, count]) => count > 0)
			.map(([id, count]) => [id, `(${count})`]),
	);
}
