import type { HighLevelCheckResult, HighLevelSlice } from "./types";

export type HighLevelRecordSubject = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
	checks: HighLevelCheckResult[];
	slices?: HighLevelSlice[];
};
