import type { Activity } from "../../../shared/emitActivity";
import type { HarnessKind } from "../../../shared/harnesses";
import type { PreviewAttachment } from "./PreviewAttachment";
import type { RepoGroup } from "./RepoGroup";

export type CommandType = "claude" | "run" | "assist";

export type PrPreviewComment = {
	quote: string;
	note: string;
};

export type PreviewKind =
	| "pr"
	| "backlog-item"
	| "pr-comment"
	| "github-issue"
	| "github-issue-comment"
	| "github-issue-edit"
	| "miro-board"
	| "slack-post"
	| "high-level-review"
	| "show"
	| "ask"
	| "question";

export type PreviewItemType = "story" | "bug";

export type PreviewMetadata = {
	label: string;
	value: string;
	url?: string;
};

export type PrPreview = {
	requestId: string;
	supersedes?: string;
	title: string;
	body: string;
	prNumber: number | null;
	kind?: PreviewKind;
	itemType?: PreviewItemType;
	canStart?: boolean;
	draft?: boolean;
	metadata?: PreviewMetadata[];
	screenshots?: PreviewAttachment[];
};

export type SessionInfoBase = {
	id: string;
	name: string;
	title?: string;
	generatedTitle?: string;
	subtitle?: string;
	commandType: CommandType;
	harness?: HarnessKind;
	startedAt: number;
	runName?: string;
	server?: boolean;
	port?: number;
	remoteOrigin?: string;
	assistArgs?: string[];
	cwd?: string;
	launchedFrom?: string;
	claudeSessionId?: string;
	harnessSessionId?: string;
	repoGroup?: RepoGroup;
	restored?: boolean;
	error?: string;
	activity?: Activity;
	autoAdvance?: boolean;
	autoApprove?: boolean;
	starred?: boolean;
	usedPct?: number;
	design?: boolean;
	pendingPrPreview?: PrPreview;
	pendingShow?: PrPreview;
	undurable?: { reason: string; removesTree?: boolean };
	joinable?: boolean;
	closing?: boolean;
	verifying?: boolean;
	seeding?: string;
	lastUserMessage?: string;
	lastAssistantMessage?: string;
	cols?: number;
	rows?: number;
	activeViewer?: string;
	activeViewerNode?: string;
	promptIssue?: string;
	promptPr?: number;
	node?: string;
};
