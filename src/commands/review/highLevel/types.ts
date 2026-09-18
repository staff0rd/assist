import type { HighLevelCheck, HighLevelCheckId } from "./highLevelChecklist";
import type { HighLevelConfig } from "./resolveHighLevelConfig";

type HighLevelCheckStatus = "pass" | "fail" | "manual";

type HighLevelVerdict = "approve" | "request-changes";

export type CheckOutcome = {
	status: "pass" | "fail";
	reason: string;
};

export type HighLevelCheckResult = HighLevelCheck & {
	status: HighLevelCheckStatus;
	reason: string;
};

export type HighLevelSubject = {
	body: string;
	changedFiles: string[];
	config: HighLevelConfig;
};

export type HighLevelReviewItem = {
	id: HighLevelCheckId;
	kind: "deterministic" | "manual";
	title: string;
	status: HighLevelCheckStatus;
	reason: string;
	ticked: boolean;
	comment?: string;
};

export type HighLevelReviewRecord = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
	verdict: HighLevelVerdict;
	reviewedAt: string;
	items: HighLevelReviewItem[];
};
