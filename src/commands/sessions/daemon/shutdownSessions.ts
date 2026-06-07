import type { Session } from "./createSession";
import { clearIdle } from "./scheduleIdle";

export function shutdownSessions(sessions: Map<string, Session>): void {
	for (const session of sessions.values()) {
		clearIdle(session);
		if (session.status !== "done") session.pty?.kill();
	}
}
