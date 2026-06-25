import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function shutdownSessions(sessions: Map<string, Session>): void {
	daemonLog(`shutting down: killing ${sessions.size} session(s)`);
	for (const session of sessions.values()) {
		if (session.status !== "done") session.pty?.kill();
	}
}
