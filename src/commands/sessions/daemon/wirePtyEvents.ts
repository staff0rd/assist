import { broadcast, type SessionClient } from "./broadcast";
import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import { noteOutputForEscInterrupt } from "./watchEscInterrupt";
import { refreshActivity } from "./watchActivity";

const MAX_SCROLLBACK = 256 * 1024;

function appendScrollback(session: Session, data: string): void {
	session.scrollback += data;
	if (session.scrollback.length > MAX_SCROLLBACK) {
		session.scrollback = session.scrollback.slice(-MAX_SCROLLBACK);
	}
}

export function wirePtyEvents(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: (
		session: Session,
		status: SessionStatus,
		exitCode?: number,
	) => void,
): void {
	if (!session.pty) return;
	/* why: running/waiting is pushed by Claude Code hooks (set-status) — including
	 * the explicit `running` the backlog-run driver emits while it works between
	 * hook-bearing phases (#447) — so the PTY stream only feeds scrollback, never
	 * status. We deliberately do NOT infer status from output: a redrawing idle
	 * prompt (spinner/status line) is indistinguishable from active work by output
	 * alone, and inferring flipped an awaiting-input card to running (#449).
	 * done/error still come from exit. */
	session.pty.onData((data) => {
		appendScrollback(session, data);
		noteOutputForEscInterrupt(session, onStatusChange);
		broadcast(clients, { type: "output", sessionId: session.id, data });
	});
	session.pty.onExit(({ exitCode }) => {
		refreshActivity(session);
		/* why: a restored session whose pty dies non-zero before emitting any
		 * output failed to resume (e.g. `claude --resume` rejected a stale id).
		 * Mark it as an error and log why, so the card surfaces the failure
		 * instead of hanging at "Starting…" with nothing in the log (#396). */
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
	});
}
