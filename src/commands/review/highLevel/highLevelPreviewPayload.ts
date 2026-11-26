import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import type { HighLevelPreviewPayload } from "./types";

export function highLevelPreviewPayload(
	subject: HighLevelOverlaySubject,
): HighLevelPreviewPayload {
	const {
		repo,
		prNumber,
		headSha,
		body,
		checks,
		structure,
		criticalDiffs,
		criticalPaths,
		tests,
		testPaths,
		collapsedPaths,
		slices,
		manualTesting,
		testRegrouping,
		saved,
		progress,
	} = subject;
	return {
		repo,
		prNumber,
		headSha,
		body,
		checks,
		structure,
		criticalDiffs,
		criticalPaths,
		tests,
		testPaths,
		collapsedPaths,
		...(slices ? { slices } : {}),
		...(manualTesting ? { manualTesting } : {}),
		...(testRegrouping ? { testRegrouping } : {}),
		...(saved ? { saved } : {}),
		...(progress ? { progress } : {}),
	};
}
