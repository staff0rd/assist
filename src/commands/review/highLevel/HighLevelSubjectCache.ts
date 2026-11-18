import type {
	HighLevelSliceSet,
	HighLevelCriticalDiff,
	HighLevelStructure,
	HighLevelTestFile,
} from "./types";

export type HighLevelSubjectCache = {
	criticalPaths: string[];
	testPaths: string[];
	changedFiles: string[];
	structure: HighLevelStructure;
	criticalDiffs: HighLevelCriticalDiff[];
	tests: HighLevelTestFile[];
};

export type HighLevelSubjectHead = {
	repo: string;
	headRef: string;
	headSha: string;
};

export type HighLevelGatherHead = HighLevelSubjectHead & { prNumber: number };

export type HighLevelGathered = {
	cache: HighLevelSubjectCache;
	sliced?: HighLevelSliceSet;
};
