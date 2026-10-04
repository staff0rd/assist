import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { appendWatcherLog } from "./worktree/appendWatcherLog";

const MAX_SCROLLBACK = 256 * 1024;

export function emitSessionOutput(
	session: Session,
	clients: Set<SessionClient>,
	data: string,
): void {
	session.scrollback += data;
	appendWatcherLog(session, data);
	if (session.scrollback.length > MAX_SCROLLBACK) {
		session.scrollback = session.scrollback.slice(-MAX_SCROLLBACK);
	}
	broadcast(clients, { type: "output", sessionId: session.id, data });
}
