import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { handlePtyExit } from "./handlePtyExit";
import type { OnStatusChange } from "./types";
import { noteOutputForEscInterrupt } from "./watchEscInterrupt";

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
	onStatusChange: OnStatusChange,
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
	session.pty.onExit(({ exitCode }) =>
		handlePtyExit(session, exitCode, onStatusChange),
	);
}
