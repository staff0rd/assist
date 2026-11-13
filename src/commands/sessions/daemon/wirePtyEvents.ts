import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { emitSessionOutput } from "./emitSessionOutput";
import { handlePtyExit } from "./handlePtyExit";
import { isSdkSession } from "./isSdkSession";
import type { OnStatusChange } from "./types";
import { wireSdkEvents } from "./wireSdkEvents";

export function wirePtyEvents(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify?: () => void,
): void {
	if (!session.pty) return;
	wireSdkEvents(session, onStatusChange, notify);
	/* why: running/waiting is pushed by Claude Code hooks (set-status) — including
	 * the explicit `running` the backlog-run driver emits while it works between
	 * hook-bearing phases (#447) — so the PTY stream only feeds scrollback, never
	 * status. We deliberately do NOT infer status from output: a redrawing idle
	 * prompt (spinner/status line) is indistinguishable from active work by output
	 * alone, and inferring flipped an awaiting-input card to running (#449).
	 * done/error still come from exit. */
	session.pty.onData((data) => emitSessionOutput(session, clients, data));
	session.pty.onExit(({ exitCode }) => {
		handlePtyExit(session, exitCode, onStatusChange);
		reportSilentFailure(session, clients);
	});
}

function reportSilentFailure(
	session: Session,
	clients: Set<SessionClient>,
): void {
	if (session.status !== "error" || !session.error) return;
	if (isSdkSession(session)) return;
	if (session.scrollback.length > 0) return;
	emitSessionOutput(
		session,
		clients,
		`\r\n\x1b[31m${session.error}\x1b[0m\r\n`,
	);
}
