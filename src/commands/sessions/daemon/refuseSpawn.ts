import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { emitSessionOutput } from "./emitSessionOutput";
import type { OnStatusChange } from "./types";

export function refuseSpawn(
	session: Session,
	error: unknown,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	stage = "respawned",
): void {
	const reason = error instanceof Error ? error.message : String(error);
	session.pty = null;
	session.pendingStart = undefined;
	session.error = reason;
	daemonLog(
		`session ${session.id} ("${session.name}") not ${stage}: ${reason}`,
	);
	broadcast(clients, { type: "clear", sessionId: session.id });
	emitSessionOutput(
		session,
		clients,
		`\r\n\x1b[31mCannot start this session: ${reason.replace(/\r?\n/g, "\r\n")}\x1b[0m\r\n`,
	);
	onStatusChange(session, "error");
}
