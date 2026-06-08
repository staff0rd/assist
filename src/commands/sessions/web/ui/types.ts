export type SessionStatus = "running" | "waiting" | "done";

type CommandType = "claude" | "run" | "assist";

export type SessionInfo = {
	id: string;
	name: string;
	commandType: CommandType;
	status: SessionStatus;
	startedAt: number;
	restored?: boolean;
};

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
};

export type SidebarTab = "active" | "history";
