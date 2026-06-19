import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { disarmEscInterrupt } from "./watchEscInterrupt";
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
	/* why: any authoritative status signal (a running hook re-asserted on the next
	 * tool call, or a pty exit) means the session is genuinely active or finished,
	 * so cancel a speculative ESC-interrupt watch before it can flip to waiting. */
	disarmEscInterrupt(session);
	/* why: Claude Code hooks re-assert "running" on every tool call; if the status
	 * is unchanged there is nothing to broadcast or auto-dismiss, so skip the work
	 * to avoid a broadcast storm during a long tool-heavy turn. */
	if (session.status === status) return;
	daemonLog(`session ${session.id} status: ${session.status} -> ${status}`);
	session.status = status;
	if (shouldAutoRun(session, exitCode) && session.activity?.itemId != null) {
		reuseForRun(session, session.activity.itemId);
		notify();
		return;
	}
	if (shouldAutoDismiss(session, exitCode)) dismiss(session.id);
	else notify();
}
