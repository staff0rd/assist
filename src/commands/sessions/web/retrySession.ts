import type { WebSocket } from "ws";
import type { Session } from "./createSession";
import { clearIdle, scheduleIdle } from "./scheduleIdle";
import { spawnRun } from "./spawnRun";
import { wirePtyEvents } from "./wirePtyEvents";
import { wsBroadcast } from "./wsBroadcast";

export function retrySession(
	session: Session,
	clients: Set<WebSocket>,
	onStatusChange: (s: Session, status: Session["status"]) => void,
): boolean {
	if (session.commandType !== "run" || !session.runName) return false;
	if (session.status !== "done") session.pty.kill();
	clearIdle(session);
	session.scrollback = "";
	session.status = "running";
	session.startedAt = Date.now();
	session.pty = spawnRun({
		name: session.runName,
		args: session.runArgs,
		cwd: session.cwd,
	});
	wsBroadcast(clients, { type: "clear", sessionId: session.id });
	wirePtyEvents(session, clients, onStatusChange);
	scheduleIdle(session, () => onStatusChange(session, "waiting"));
	return true;
}
