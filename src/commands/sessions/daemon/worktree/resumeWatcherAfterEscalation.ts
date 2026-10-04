import { daemonLog } from "../daemonLog";
import type { Session } from "../types";
import { canonicalTreePath } from "./canonicalTreePath";

const ENDED: Session["status"][] = ["done", "error"];

const endedViaDismissOrExit = new WeakSet<Session>();

export function resumeWatcherAfterEscalation(
	sessions: Map<string, Session>,
	escalation: Session,
	restart: (watcherId: string) => void,
): void {
	if (escalation.divergenceEscalation !== true || !escalation.cwd) return;
	if (endedViaDismissOrExit.has(escalation)) return;
	endedViaDismissOrExit.add(escalation);
	const clone = canonicalTreePath(escalation.cwd);
	const watcher = [...sessions.values()].find(
		(s) =>
			s.watcher === true &&
			s.cwd !== undefined &&
			canonicalTreePath(s.cwd) === clone,
	);
	if (!watcher) {
		daemonLog(
			`escalation session ${escalation.id} ended: no watcher left in the clone ${clone} to restart`,
		);
		return;
	}
	if (!ENDED.includes(watcher.status)) {
		daemonLog(
			`escalation session ${escalation.id} ended: watcher session ${watcher.id} in the clone ${clone} is already ${watcher.status}`,
		);
		return;
	}
	daemonLog(
		`escalation session ${escalation.id} ended: restarting watcher session ${watcher.id} in the clone ${clone}`,
	);
	restart(watcher.id);
}
