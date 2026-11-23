type AutopilotTickOutcome = "launched" | "skipped" | "failed" | "finished";

export type AutopilotTick = {
	at: string;
	outcome: AutopilotTickOutcome;
	trigger?: "scheduled" | "manual";
	sessionId?: string;
	reason?: string;
	/** On a finished tick: when the run started, the items it started and what it recorded. */
	startedAt?: string;
	items?: number[];
	summary?: AutopilotRunSummary;
};

/** What a run did, recorded by the run itself with `assist autopilot summary`. */
export type AutopilotRunSummary = {
	checked: string;
	decided: string;
	started: string;
	next: string;
};

export type AutopilotRun = {
	sessionId: string;
	startedAt: string;
	summary?: AutopilotRunSummary;
	/** When the daemon prompted the idle run to record its summary. */
	summaryRequestedAt?: string;
};

export type AutopilotFollowUp = {
	at: string;
	requestedAt: string;
	sessionId: string;
	item?: string;
};

/** A backlog item an autopilot run started. */
export type AutopilotItem = {
	id: number;
	startedAt: string;
	/** Times the scheduler resumed it after it stalled. */
	resumes?: number;
	/** Stopped from the page, so never resumed automatically. */
	stopped?: boolean;
};

/** Why the scheduler paused itself, shown on the page until resumed. */
export type AutopilotFailure = {
	at: string;
	reason: string;
	item?: string;
	phase?: string;
	sessionId?: string;
};

export type AutopilotRepoRecord = {
	paused: boolean;
	current?: AutopilotRun;
	followUp?: AutopilotFollowUp;
	items?: AutopilotItem[];
	/** Why the scheduler paused itself; cleared on resume. */
	failure?: AutopilotFailure;
	/** Legacy reason-only form of failure, from records saved before it. */
	pauseReason?: string;
	ticks: AutopilotTick[];
};

export type AutopilotRecord = Record<string, AutopilotRepoRecord>;
