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
export type AutopilotItem = { id: number; startedAt: string };

export type AutopilotRepoRecord = {
	paused: boolean;
	current?: AutopilotRun;
	followUp?: AutopilotFollowUp;
	items?: AutopilotItem[];
	ticks: AutopilotTick[];
};

export type AutopilotRecord = Record<string, AutopilotRepoRecord>;
