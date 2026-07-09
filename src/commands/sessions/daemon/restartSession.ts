import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { respawnSession } from "./respawnSession";
import { respawnPlan } from "./respawnPlan";
import type { OnStatusChange } from "./types";

export function restartSession(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): boolean {
	const plan = respawnPlan(session);
	if (!plan) return false;
	const via = session.claudeSessionId
		? `resume ${session.claudeSessionId}`
		: "fresh";
	const respawn = () => {
		respawnSession(session, plan.spawn, plan.status, clients, onStatusChange);
		daemonLog(`session ${session.id} restarted (${via}): ${session.name}`);
	};

	const pty = session.pty;
	if (pty && session.status !== "done") {
		daemonLog(
			`session ${session.id} restart requested: killing running process, will resume on exit`,
		);
		session.pendingRestart = respawn;
		killPtyTree(pty);
	} else {
		respawn();
	}
	return true;
}

function killPtyTree(pty: NonNullable<Session["pty"]>): void {
	if (process.platform === "win32") {
		pty.kill();
		return;
	}
	try {
		process.kill(-pty.pid, "SIGHUP");
	} catch {
		try {
			pty.kill();
		} catch {}
	}
}
