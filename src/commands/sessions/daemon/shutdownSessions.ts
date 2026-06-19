import type { Session } from "./createSession";

export function shutdownSessions(sessions: Map<string, Session>): void {
	for (const session of sessions.values()) {
		if (session.status !== "done") session.pty?.kill();
	}
}
