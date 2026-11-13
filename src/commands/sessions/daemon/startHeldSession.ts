import type { SessionClient } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { heldStartBlocked } from "./heldStartBlocked";
import { refuseSpawn } from "./refuseSpawn";
import type { OnStatusChange, Session } from "./types";
import { wirePtyEvents } from "./wirePtyEvents";

export function startHeldSession(
	session: Session,
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify: () => void,
	trigger?: string,
): void {
	const start = session.pendingStart;
	if (!start) return;
	session.pendingStart = undefined;
	session.awaitingSeed = undefined;
	if (heldStartBlocked(session, sessions)) return;
	session.startedAt = Date.now();
	if (session.status === "running") session.runningSince = session.startedAt;
	try {
		session.pty = start();
	} catch (error) {
		refuseSpawn(
			session,
			error,
			clients,
			onStatusChange,
			"started after seeding",
		);
		notify();
		return;
	}
	if (session.cols && session.rows)
		try {
			session.pty?.resize(session.cols, session.rows);
		} catch {}
	wirePtyEvents(session, clients, onStatusChange, notify);
	daemonLog(
		`session ${session.id} started once ${trigger ?? `worktree ${session.worktree?.path ?? session.cwd} finished seeding`}`,
	);
	notify();
}
