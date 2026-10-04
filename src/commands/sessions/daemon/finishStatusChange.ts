import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import { setStatus } from "./setStatus";
import { shouldAutoDismiss } from "./shouldAutoDismiss";
import { shouldAutoRun } from "./shouldAutoRun";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";

const DIVERGED_EXIT_CODE = 3;

export type StatusChangeDeps = {
	dismiss: (id: string) => void;
	notify: () => void;
	reuseForRun: (session: Session, itemId: number) => void;
	escalateDivergence?: (watcher: Session) => void;
	resumeWatcher?: (escalation: Session) => void;
};

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
	if (session.watcher === true && exitCode === DIVERGED_EXIT_CODE)
		deps.escalateDivergence?.(session);
	if (status === "done" || status === "error") deps.resumeWatcher?.(session);
	const autoRun = shouldAutoRun(session);
	if (autoRun.run) {
		deps.reuseForRun(session, autoRun.itemId);
		deps.notify();
		return;
	}
	if (status === "done" && autoRun.reason != null) {
		daemonLog(
			`session ${session.id} auto-run enabled but skipped (exit ${exitCode ?? "none"}): ${autoRun.reason}`,
		);
	}
	if (shouldAutoDismiss(session, exitCode)) deps.dismiss(session.id);
	else deps.notify();
}
