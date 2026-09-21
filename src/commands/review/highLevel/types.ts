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

export type HighLevelFileStatus = "added" | "removed" | "modified";

export type HighLevelFile = {
	path: string;
	status: HighLevelFileStatus;
	additions: number;
	deletions: number;
	diffUrl: string;
	patch?: string;
};

export type HighLevelTreeFile = HighLevelFile & {
	kind: "file";
	name: string;
};

export type HighLevelTreeDir = {
	kind: "dir";
	name: string;
	path: string;
	additions: number;
	deletions: number;
	children: HighLevelTreeNode[];
};

export type HighLevelTreeNode = HighLevelTreeDir | HighLevelTreeFile;

export type HighLevelStructure = {
	tree: HighLevelTreeNode[];
	added: number;
	removed: number;
	modified: number;
	additions: number;
	deletions: number;
};

export type HighLevelCriticalDiff = {
	path: string;
	status: HighLevelFileStatus;
	additions: number;
	deletions: number;
	diffUrl: string;
	patch: string | null;
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

export type HighLevelPreviewPayload = {
	checks: HighLevelCheckResult[];
	structure: HighLevelStructure;
	criticalDiffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
	saved?: HighLevelReviewRecord;
};
