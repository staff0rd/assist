import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
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
	refreshActivity(session);
	const failedResume =
		session.restored === true &&
		exitCode !== 0 &&
		session.scrollback.length === 0;
	if (failedResume) {
		session.error = `resume process exited with code ${exitCode} before producing any output`;
		daemonLog(
			`could not resume restored session "${session.name}" (id ${session.id}): ${session.error}`,
		);
		onStatusChange(session, "error", exitCode);
		return;
	}
	const priorStatus = session.status;
	const unexpected = priorStatus === "waiting" || exitCode !== 0;
	daemonLog(
		`session ${session.id} ("${session.name}") pty exited with code ${exitCode} from status "${priorStatus}" ` +
			`(${session.scrollback.length} bytes of output) — ${unexpected ? "unexpected exit, process died mid-session" : "expected completion"}; marking done`,
	);
	onStatusChange(session, "done", exitCode);
}
