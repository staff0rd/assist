import type { WebSocket } from "ws";
import type { Session, SessionStatus } from "./createSession";
import { clearIdle, scheduleIdle } from "./scheduleIdle";
import { wsBroadcast } from "./wsBroadcast";

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
	clients: Set<WebSocket>,
	onStatusChange: (session: Session, status: SessionStatus) => void,
): void {
	session.pty.onData((data) => {
		appendScrollback(session, data);
		const isRedraw = Date.now() - session.lastResizeAt < RESIZE_GRACE_MS;
		if (!isRedraw && session.status !== "running")
			onStatusChange(session, "running");
		if (!isRedraw)
			scheduleIdle(session, () => onStatusChange(session, "waiting"));
		wsBroadcast(clients, { type: "output", sessionId: session.id, data });
	});
	session.pty.onExit(() => {
		clearIdle(session);
		onStatusChange(session, "done");
	});
}
