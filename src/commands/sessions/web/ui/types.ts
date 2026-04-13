export type SessionStatus = "running" | "waiting" | "done";

export type SessionInfo = {
	id: string;
	name: string;
	status: SessionStatus;
	startedAt: number;
};
