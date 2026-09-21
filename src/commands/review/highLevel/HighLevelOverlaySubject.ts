import type {
	HighLevelCheckResult,
	HighLevelCriticalDiff,
	HighLevelReviewRecord,
	HighLevelStructure,
} from "./types";

export type HighLevelOverlaySubject = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
	checks: HighLevelCheckResult[];
	structure: HighLevelStructure;
	criticalDiffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
	saved?: HighLevelReviewRecord;
};
