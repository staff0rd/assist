import { announceFreshRestart } from "./announceFreshRestart";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { respawnSession } from "./respawnSession";
import { respawnPlan } from "./respawnPlan";
import type { OnStatusChange } from "./types";
import { killPtyTree } from "./killPtyTree";

export function restartSession(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): boolean {
	const plan = respawnPlan(session);
	if (!plan) return false;
	const respawn = () => {
		respawnSession(session, plan.spawn, plan.status, clients, onStatusChange);
		const resume: { id?: string; reason?: string } = plan.resumeOutcome?.() ?? {
			id: session.claudeSessionId,
		};
		if (resume.reason && session.pty)
			announceFreshRestart(session, clients, resume.reason);
		daemonLog(
			`session ${session.id} restarted (${resume.id ? `resume ${resume.id}` : `fresh${resume.reason ? `: ${resume.reason}` : ""}`}): ${session.name}`,
		);
	};

	const pty = session.pty;
	const alive = session.status === "running" || session.status === "waiting";
	if (pty && alive) {
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
