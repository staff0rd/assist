import type { SessionInfo } from "./types";

export function isServing(session: SessionInfo): boolean {
	return (
		session.commandType === "run" &&
		session.server === true &&
		session.status !== "done" &&
		session.status !== "error"
	);
}

export function findServingSession(
	sessions: SessionInfo[],
	remoteOrigin: string | undefined,
): SessionInfo | undefined {
	if (!remoteOrigin) return undefined;
	return sessions.find((s) => s.remoteOrigin === remoteOrigin && isServing(s));
}
