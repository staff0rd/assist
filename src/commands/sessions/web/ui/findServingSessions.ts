import type { SessionInfo } from "./types";

export function isServing(session: SessionInfo): boolean {
	return (
		session.commandType === "run" &&
		session.server === true &&
		session.status !== "done" &&
		session.status !== "error"
	);
}

export function findServingSessions(sessions: SessionInfo[]): SessionInfo[] {
	return sessions.filter(isServing);
}
