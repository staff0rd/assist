import type { Activity } from "../../../shared/emitActivity";
import { bindCodexSession } from "./bindCodexSession";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function applyCodexLaunch(
	session: Session,
	activity: Activity,
	notify: () => void,
): void {
	if (activity.harnessSessionId) {
		if (session.harnessSessionId === activity.harnessSessionId) return;
		session.harnessSessionId = activity.harnessSessionId;
		daemonLog(
			`session ${session.id} resumed codex conversation ${activity.harnessSessionId}`,
		);
		notify();
		return;
	}
	if (session.harnessSessionId)
		daemonLog(
			`session ${session.id} started a fresh codex conversation; unbinding ${session.harnessSessionId}`,
		);
	session.harnessSessionId = undefined;
	bindCodexSession(session, notify, activity.startedAt);
}
