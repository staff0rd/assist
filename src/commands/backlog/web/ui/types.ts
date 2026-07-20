type PlanTask = {
	task: string;
};

export type PlanPhase = {
	name: string;
	tasks: PlanTask[];
	manualChecks?: string[];
};

export type PhaseUsage = {
	phaseIdx: number;
	tokensUp: number;
	tokensDown: number;
	activeMs: number;
	peakContextPct: number;
};

export type PhaseUsageTotal = {
	tokensUp: number;
	tokensDown: number;
	activeMs: number;
	peakContextPct: number;
};

export type PhaseSession = {
	phaseIdx: number;
	claudeSessionId: string;
	hostname: string;
	osUser: string;
};

export type BacklogComment = {
	id?: number;
	text: string;
	phase?: number;
	timestamp: string;
	type: "comment" | "summary";
};

export type PhaseStatus = "done" | "current" | "upcoming";

export type BacklogStatus = "todo" | "in-progress" | "done" | "wontdo";

export type SubtaskStatus = "todo" | "in-progress" | "done";

export type Subtask = {
	title: string;
	description?: string;
	status: SubtaskStatus;
};

type GitRefKind = "branch" | "commit" | "pr";

export type GitRef = {
	kind: GitRefKind;
	ref: string;
	title?: string;
	url?: string;
	state?: string;
	createdAt?: string;
};

export type BacklogItem = {
	id: number;
	type: "story" | "bug";
	name: string;
	description?: string;
	acceptanceCriteria: string[];
	plan?: PlanPhase[];
	currentPhase?: number;
	status: BacklogStatus;
	origin?: string;
	jiraKey?: string;
	githubIssue?: string;
	comments?: BacklogComment[];
	subtasks?: Subtask[];
	phaseUsage?: PhaseUsage[];
	phaseSessions?: PhaseSession[];
	usageTotal?: PhaseUsageTotal;
	gitRefs?: GitRef[];
};

/** The trimmed-down shape the list renders; full data loads when an item opens. */
export type BacklogItemSummary = {
	id: number;
	type: "story" | "bug";
	name: string;
	status: BacklogStatus;
	origin?: string;
	starred: boolean;
	jiraKey?: string;
	githubIssue?: string;
	incompleteSubtasks: number;
	usageTotal?: PhaseUsageTotal;
};
