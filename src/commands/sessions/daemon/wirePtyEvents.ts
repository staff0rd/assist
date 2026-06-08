import { broadcast, type SessionClient } from "./broadcast";
import type { Session, SessionStatus } from "./createSession";
import { clearIdle, scheduleIdle } from "./scheduleIdle";

const MAX_SCROLLBACK = 256 * 1024;
const RESIZE_GRACE_MS = 500;

function appendScrollback(session: Session, data: string): void {
	session.scrollback += data;
	if (session.scrollback.length > MAX_SCROLLBACK) {
		session.scrollback = session.scrollback.slice(-MAX_SCROLLBACK);
	}
}

export function wirePtyEvents(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: (
		session: Session,
		status: SessionStatus,
		exitCode?: number,
	) => void,
): void {
	if (!session.pty) return;
	session.pty.onData((data) => {
		appendScrollback(session, data);
		const isRedraw = Date.now() - session.lastResizeAt < RESIZE_GRACE_MS;
		if (!isRedraw && session.status !== "running")
			onStatusChange(session, "running");
		if (!isRedraw)
			scheduleIdle(session, () => onStatusChange(session, "waiting"));
		broadcast(clients, { type: "output", sessionId: session.id, data });
	});
	session.pty.onExit(({ exitCode }) => {
		clearIdle(session);
		onStatusChange(session, "done", exitCode);
	});
	scheduleIdle(session, () => onStatusChange(session, "waiting"));
}
