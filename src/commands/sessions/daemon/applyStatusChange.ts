import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import { setStatus } from "./setStatus";
import { shouldAutoDismiss } from "./shouldAutoDismiss";
import { shouldAutoRun } from "./shouldAutoRun";

export function applyStatusChange(
	session: Session,
	status: Session["status"],
	exitCode: number | undefined,
	dismiss: (id: string) => void,
	notify: () => void,
	reuseForRun: (session: Session, itemId: number) => void,
): void {
	/* why: Claude Code hooks re-assert "running" on every tool call; if the status
	 * is unchanged there is nothing to broadcast or auto-dismiss, so skip the work
	 * to avoid a broadcast storm during a long tool-heavy turn. */
	if (session.status === status) return;
	daemonLog(`session ${session.id} status: ${session.status} -> ${status}`);
	void flushPhaseActiveMs(session);
	setStatus(session, status);
	const autoRun = shouldAutoRun(session);
	if (autoRun.run) {
		reuseForRun(session, autoRun.itemId);
		notify();
		return;
	}
	if (status === "done" && autoRun.reason != null) {
		daemonLog(
			`session ${session.id} auto-run enabled but skipped (exit ${exitCode ?? "none"}): ${autoRun.reason}`,
		);
	}
	if (shouldAutoDismiss(session, exitCode)) dismiss(session.id);
	else notify();
}
