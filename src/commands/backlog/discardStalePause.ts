import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { clearPause, isPausePending } from "./consumePause";
import { isWake } from "./phaseRun/isWake";

export function discardStalePause(itemId: number): void {
	if (!isPausePending(itemId)) return;
	if (isWake()) return;
	if (process.env.ASSIST_KEEP_PAUSE) {
		appendDaemonLog(
			`backlog run ${itemId}: kept the pending pause file at run start; ` +
				`this run was relaunched by a daemon restore, so the user's Continue-off still applies`,
		);
		return;
	}
	clearPause(itemId);
	appendDaemonLog(
		`backlog run ${itemId}: discarded stale pause file at run start; ` +
			`this run starts auto-advancing (Continue on) regardless of a prior run's pause`,
	);
}
