type AutopilotTickOutcome = "launched" | "skipped" | "failed" | "finished";

export type AutopilotTick = {
	at: string;
	outcome: AutopilotTickOutcome;
	trigger?: "scheduled" | "manual";
	sessionId?: string;
	reason?: string;
};

export type AutopilotRun = { sessionId: string; startedAt: string };

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

export type AutopilotRepoRecord = {
	paused: boolean;
	current?: AutopilotRun;
	followUp?: AutopilotFollowUp;
	items?: AutopilotItem[];
	/** Why the scheduler paused itself; cleared on resume. */
	pauseReason?: string;
	ticks: AutopilotTick[];
};

export type AutopilotRecord = Record<string, AutopilotRepoRecord>;
