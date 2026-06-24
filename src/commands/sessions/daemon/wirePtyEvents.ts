import { broadcast, type SessionClient } from "./broadcast";
import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import { noteOutputForEscInterrupt } from "./watchEscInterrupt";
import { refreshActivity } from "./watchActivity";
import { noteOutputForThinking } from "./noteOutputForThinking";

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
	/* why: running/waiting is primarily pushed by Claude Code hooks (set-status),
	 * but an extended-thinking phase emits output yet fires no hook, so sustained
	 * output while waiting is treated as activity and flips back to running
	 * (watchThinking, #447). done/error still come from exit. */
	session.pty.onData((data) => {
		appendScrollback(session, data);
		noteOutputForEscInterrupt(session, onStatusChange);
		noteOutputForThinking(session, onStatusChange);
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
		}
		onStatusChange(session, failedResume ? "error" : "done", exitCode);
	});
}
