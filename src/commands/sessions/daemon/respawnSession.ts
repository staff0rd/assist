import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { setStatus } from "./setStatus";
import { wirePtyEvents } from "./wirePtyEvents";

export type OnStatusChange = (
	s: Session,
	status: Session["status"],
	exitCode?: number,
) => void;

export function respawnSession(
	session: Session,
	respawn: () => Session["pty"],
	status: Session["status"],
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): void {
	session.scrollback = "";
	session.startedAt = Date.now();
	session.runningMs = 0;
	session.runningSince = null;
	setStatus(session, status);
	session.restored = undefined;
	session.pty = respawn();
	broadcast(clients, { type: "clear", sessionId: session.id });
	wirePtyEvents(session, clients, onStatusChange);
}
