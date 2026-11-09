import type { Activity } from "../../../shared/emitActivity";
import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { bindConversation } from "./bindConversation";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function applyLateBoundLaunch(
	session: Session,
	activity: Activity,
	notify: () => void,
	onBound?: (session: Session) => void,
): void {
	const label = harnessAdapter(activity.harness).label;
	if (activity.harnessSessionId) {
		if (session.harnessSessionId === activity.harnessSessionId) return;
		session.harnessSessionId = activity.harnessSessionId;
		daemonLog(
			`session ${session.id} resumed ${label} conversation ${activity.harnessSessionId}`,
		);
		onBound?.(session);
		notify();
		return;
	}
	if (session.harnessSessionId)
		daemonLog(
			`session ${session.id} started a fresh ${label} conversation; unbinding ${session.harnessSessionId}`,
		);
	session.harnessSessionId = undefined;
	onBound?.(session);
	bindConversation(session, notify, activity.startedAt, onBound);
}
