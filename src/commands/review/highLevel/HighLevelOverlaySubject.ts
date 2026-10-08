import type {
	HighLevelCheckResult,
	HighLevelCriticalDiff,
	HighLevelReviewRecord,
	HighLevelStructure,
	HighLevelTestFile,
} from "./types";

export type HighLevelOverlaySubject = {
	repo: string;
	prNumber: number;
	title: string;
	headRef: string;
	headSha: string;
	checks: HighLevelCheckResult[];
	structure: HighLevelStructure;
	criticalDiffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
	tests: HighLevelTestFile[];
	testPaths: string[];
	saved?: HighLevelReviewRecord;
};
