export type SessionStatus = "running" | "waiting" | "done";

export type SessionInfo = {
	id: string;
	name: string;
	status: SessionStatus;
	startedAt: number;
};

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
};

export type SidebarTab = "active" | "history";
