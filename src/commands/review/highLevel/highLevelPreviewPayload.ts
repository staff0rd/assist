import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import type { HighLevelPreviewPayload } from "./types";

export function highLevelPreviewPayload(
	subject: HighLevelOverlaySubject,
): HighLevelPreviewPayload {
	const {
		repo,
		prNumber,
		checks,
		structure,
		criticalDiffs,
		criticalPaths,
		tests,
		testPaths,
		saved,
	} = subject;
	return {
		repo,
		prNumber,
		checks,
		structure,
		criticalDiffs,
		criticalPaths,
		tests,
		testPaths,
		...(saved ? { saved } : {}),
	};
}
