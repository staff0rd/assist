import type { Session } from "./types";

export function liveSessionCount(sessions: Map<string, Session>): number {
	let count = 0;
	for (const session of sessions.values()) if (!session.leftoverNotice) count++;
	return count;
}
