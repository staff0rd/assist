import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import type { HighLevelPreviewPayload } from "./types";

export function highLevelPreviewPayload(
	subject: HighLevelOverlaySubject,
): HighLevelPreviewPayload {
	const {
		repo,
		prNumber,
		headSha,
		checks,
		structure,
		criticalDiffs,
		criticalPaths,
		tests,
		testPaths,
		collapsedPaths,
		slices,
		saved,
		draft,
	} = subject;
	return {
		repo,
		prNumber,
		headSha,
		checks,
		structure,
		criticalDiffs,
		criticalPaths,
		tests,
		testPaths,
		collapsedPaths,
		...(slices ? { slices } : {}),
		...(saved ? { saved } : {}),
		...(draft ? { draft } : {}),
	};
}
