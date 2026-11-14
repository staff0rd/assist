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
		saved,
		draft,
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
		...(saved ? { saved } : {}),
		...(draft ? { draft } : {}),
	};
}
