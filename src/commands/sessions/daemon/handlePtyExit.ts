import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { handleErroredExit } from "./handleErroredExit";
import { handleFailedResume } from "./handleFailedResume";
import { handleRefusedRun } from "./handleRefusedRun";
import { handleStoppedExit } from "./handleStoppedExit";
import type { OnStatusChange } from "./types";
import { refreshActivity } from "./watchActivity";

export function handlePtyExit(
	session: Session,
	exitCode: number,
	onStatusChange: OnStatusChange,
): void {
	if (session.pendingRestart) {
		const resume = session.pendingRestart;
		session.pendingRestart = undefined;
		daemonLog(
			`session ${session.id} ("${session.name}") pty exited (code ${exitCode}) for restart; resuming now the process is gone`,
		);
		resume();
		return;
	}
	session.pty = null;
	if (session.pendingDismiss) {
		const dismiss = session.pendingDismiss;
		session.pendingDismiss = undefined;
		daemonLog(
			`session ${session.id} ("${session.name}") pty exited (code ${exitCode}) for dismiss; resolving durability now the process is gone`,
		);
		dismiss();
		return;
	}
	if (handleStoppedExit(session, exitCode, onStatusChange)) return;
	refreshActivity(session);
	if (handleRefusedRun(session, exitCode, onStatusChange)) return;
	if (handleFailedResume(session, exitCode, onStatusChange)) return;
	const priorStatus = session.status;
	if (exitCode !== 0) {
		handleErroredExit(session, exitCode, priorStatus, onStatusChange);
		return;
	}
	const unexpected = priorStatus === "waiting";
	daemonLog(
		`session ${session.id} ("${session.name}") pty exited with code ${exitCode} from status "${priorStatus}" ` +
			`(${session.scrollback.length} bytes of output) — ${unexpected ? "unexpected exit, process died mid-session" : "expected completion"}; marking done`,
	);
	onStatusChange(session, "done", exitCode);
}
