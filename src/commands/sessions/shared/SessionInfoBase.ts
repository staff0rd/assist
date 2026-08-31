import type { Activity } from "../../../shared/emitActivity";
import type { HarnessKind } from "../../../shared/harnesses";
import type { RepoGroup } from "./RepoGroup";

export type CommandType = "claude" | "run" | "assist";

export type PrPreviewComment = {
	quote: string;
	note: string;
};

export type PreviewKind =
	| "pr"
	| "backlog-item"
	| "backlog-comment"
	| "pr-comment"
	| "github-issue"
	| "github-issue-comment"
	| "github-issue-edit"
	| "miro-board"
	| "slack-post";

export type PreviewItemType = "story" | "bug";

export type PreviewMetadata = {
	label: string;
	value: string;
};

export type PrPreview = {
	requestId: string;
	title: string;
	body: string;
	prNumber: number | null;
	kind?: PreviewKind;
	itemType?: PreviewItemType;
	draft?: boolean;
	metadata?: PreviewMetadata[];
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
	autoRun?: boolean;
	autoAdvance?: boolean;
	starred?: boolean;
	watcher?: boolean;
	usedPct?: number;
	design?: boolean;
	pendingPrPreview?: PrPreview;
	undurable?: { reason: string; removesTree?: boolean };
	joinable?: boolean;
	closing?: boolean;
	verifying?: boolean;
	lastUserMessage?: string;
};
