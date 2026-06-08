import type { Activity } from "../../../../shared/emitActivity";

export type SessionStatus = "running" | "waiting" | "done";

type CommandType = "claude" | "run" | "assist";

export type SessionInfo = {
	id: string;
	name: string;
	commandType: CommandType;
	status: SessionStatus;
	startedAt: number;
	runName?: string;
	assistArgs?: string[];
	cwd?: string;
	restored?: boolean;
	activity?: Activity;
};

export type HistoricalSession = {
	sessionId: string;
	name: string;
	project: string;
	cwd: string;
	timestamp: string;
};

export type SidebarTab = "active" | "history";
