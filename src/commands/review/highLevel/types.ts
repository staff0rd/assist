import type { PreviewReviewComment } from "../../sessions/shared/PreviewDecision";
import type { HighLevelCheck, HighLevelCheckId } from "./highLevelChecklist";
import type { HighLevelConfig } from "./resolveHighLevelConfig";

type HighLevelCheckStatus = "pass" | "fail" | "manual";

type HighLevelVerdict = "approve" | "comment" | "request-changes";

export type CheckOutcome = {
	status: "pass" | "fail";
	reason: string;
};

export type HighLevelCheckResult = HighLevelCheck & {
	status: HighLevelCheckStatus;
	reason: string;
};

export type PrMergeable = "MERGEABLE" | "CONFLICTING" | "UNKNOWN";

export type HighLevelSubject = {
	body: string;
	linkedIssues: string[];
	mergeable: PrMergeable;
	baseRef: string;
	changedFiles: string[];
	config: HighLevelConfig;
};

export type HighLevelFileStatus = "added" | "removed" | "modified";

export type HighLevelForeignHunk = {
	oldStart: number;
	header: string;
	slice: number;
};

export type HighLevelSliceSplit = {
	hunks: number;
	of: number;
	elsewhere: HighLevelForeignHunk[];
};

export type HighLevelFile = {
	path: string;
	status: HighLevelFileStatus;
	additions: number;
	deletions: number;
	diffUrl: string;
	patch?: string;
	truncated?: boolean;
	split?: HighLevelSliceSplit;
	critical?: boolean;
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
	truncated?: boolean;
};

type HighLevelTestBase = { name: string; line: number };

export type HighLevelTestExcerpt = { line: number; source: string };

export type HighLevelTestCase = HighLevelTestBase & {
	kind: "it";
	id: string;
	change?: "added" | "modified";
	source?: string;
	changedLines?: number[];
	excerpts?: HighLevelTestExcerpt[];
	truncated?: boolean;
	overBudget?: boolean;
};

type HighLevelTestSuite = HighLevelTestBase & {
	kind: "describe";
	children: HighLevelTestNode[];
};

export type HighLevelTestNode = HighLevelTestSuite | HighLevelTestCase;

export type HighLevelTestFile = Pick<
	HighLevelFile,
	"path" | "status" | "additions" | "deletions" | "diffUrl"
> & { tests: HighLevelTestNode[] };

export type HighLevelReviewItem = {
	id: HighLevelCheckId;
	kind: "deterministic" | "manual";
	title: string;
	status: HighLevelCheckStatus;
	reason: string;
	ticked: boolean;
	comment?: string;
};

export type HighLevelReviewProgress = {
	items: HighLevelReviewItem[];
	reviewComments?: PreviewReviewComment[];
};

type HighLevelReviewHead = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
};

export type HighLevelReviewRecord = HighLevelReviewHead &
	HighLevelReviewProgress & {
		verdict: HighLevelVerdict;
		reviewedAt: string;
	};

export type HighLevelReviewDraft = HighLevelReviewHead &
	HighLevelReviewProgress & { savedAt: string };

export type HighLevelSlice = {
	title: string;
	summary: string;
	hunks: string[];
	additions: number;
	deletions: number;
	rest?: boolean;
};

export type HighLevelPreviewPayload = {
	repo: string;
	prNumber: number;
	headSha: string;
	checks: HighLevelCheckResult[];
	structure: HighLevelStructure;
	criticalDiffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
	tests: HighLevelTestFile[];
	testPaths: string[];
	collapsedPaths: string[];
	slices?: HighLevelSlice[];
	saved?: HighLevelReviewRecord;
	draft?: HighLevelReviewDraft;
};
