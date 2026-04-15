export type SessionStatus = "running" | "waiting" | "done";

type CommandType = "claude" | "run";

export type SessionInfo = {
	id: string;
	name: string;
	commandType: CommandType;
	status: SessionStatus;
	startedAt: number;
	runName?: string;
	runArgs?: string[];
	cwd?: string;
};

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
};

type RunParam = {
	name: string;
	required?: boolean;
	default?: string;
	description?: string;
};

export type RunConfigInfo = {
	name: string;
	params?: RunParam[];
};

export type SidebarTab = "active" | "history";
