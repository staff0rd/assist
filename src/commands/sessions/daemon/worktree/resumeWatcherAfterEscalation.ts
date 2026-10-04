import { daemonLog } from "../daemonLog";
import type { Session } from "../types";
import { canonicalTreePath } from "./canonicalTreePath";

const ENDED: Session["status"][] = ["done", "error"];

export function resumeWatcherAfterEscalation(
	sessions: Map<string, Session>,
	escalation: Session,
	restart: (watcherId: string) => void,
): void {
	if (escalation.divergenceEscalation !== true || !escalation.cwd) return;
	const clone = canonicalTreePath(escalation.cwd);
	const watcher = [...sessions.values()].find(
		(s) =>
			s.watcher === true &&
			s.cwd !== undefined &&
			canonicalTreePath(s.cwd) === clone,
	);
	if (!watcher) {
		daemonLog(
			`escalation session ${escalation.id} ended (${escalation.status}): no watcher left in the clone ${clone} to restart`,
		);
		return;
	}
	if (!ENDED.includes(watcher.status)) {
		daemonLog(
			`escalation session ${escalation.id} ended (${escalation.status}): watcher session ${watcher.id} in the clone ${clone} is already ${watcher.status}`,
		);
		return;
	}
	daemonLog(
		`escalation session ${escalation.id} ended (${escalation.status}): restarting watcher session ${watcher.id} in the clone ${clone}`,
	);
	restart(watcher.id);
}
