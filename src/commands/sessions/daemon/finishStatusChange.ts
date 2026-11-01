import { autoDismissReason } from "./autoDismissReason";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import { reportUndeliveredPrompts } from "./reportUndeliveredPrompts";
import { killedByDaemonRestart } from "./SessionInterruption";
import { setStatus } from "./setStatus";
import { shouldAutoDismiss } from "./shouldAutoDismiss";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";

export type StatusChangeDeps = {
	dismiss: (id: string) => void;
	notify: () => void;
	idle?: (session: Session) => void;
};

function endsWithoutRestart(session: Session, status: Session["status"]) {
	return (
		(status === "done" || status === "error") &&
		!killedByDaemonRestart(session.interrupted)
	);
}

export function finishStatusChange(
	session: Session,
	status: Session["status"],
	exitCode: number | undefined,
	deps: StatusChangeDeps,
): void {
	daemonLog(`session ${session.id} status: ${session.status} -> ${status}`);
	void flushPhaseActiveMs(session);
	setStatus(session, status);
	if (status === "waiting")
		startTranscriptTitleGeneration(session, deps.notify);
	if (status !== "stopped") session.undurable = undefined;
	if (endsWithoutRestart(session, status))
		reportUndeliveredPrompts(session, `ended (${status})`);
	if (shouldAutoDismiss(session, exitCode)) {
		daemonLog(
			`session ${session.id} auto-dismissed: ${autoDismissReason(session)}`,
		);
		deps.dismiss(session.id);
	} else deps.notify();
	if (status !== "running") deps.idle?.(session);
}
