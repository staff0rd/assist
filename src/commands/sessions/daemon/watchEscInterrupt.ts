import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";

type OnStatusChange = (session: Session, status: SessionStatus) => void;

/* why: Claude Code's Stop hook does not fire on a user ESC interrupt, so the
 * daemon never receives the set-status waiting that ends a normal turn and the
 * session stays "running" forever. We watch for the ESC keystroke and, once
 * output settles, flip running -> waiting ourselves (#416). Any authoritative
 * status signal (a running hook, a pty exit) disarms the watch, so a genuinely
 * running session is never falsely marked waiting. */
const ESC = "\x1b";
const SETTLE_MS = 1_000;

/* A bare Escape keypress arrives as a lone 0x1b; arrow/function keys send ESC
 * followed by "[" or "O" (CSI/SS3) and must not be treated as an interrupt. */
function isInterruptKey(data: string): boolean {
	return data === ESC;
}

function scheduleSettle(
	session: Session,
	onStatusChange: OnStatusChange,
): void {
	if (session.escInterruptTimer) clearTimeout(session.escInterruptTimer);
	session.escInterruptTimer = setTimeout(() => {
		session.escInterruptTimer = undefined;
		if (session.status !== "running") return;
		daemonLog(`session ${session.id} esc-interrupt settled -> waiting`);
		onStatusChange(session, "waiting");
	}, SETTLE_MS);
}

export function watchEscInterrupt(
	session: Session,
	data: string,
	onStatusChange: OnStatusChange,
): void {
	if (session.status !== "running") return;
	if (!isInterruptKey(data)) return;
	scheduleSettle(session, onStatusChange);
}

export function noteOutputForEscInterrupt(
	session: Session,
	onStatusChange: OnStatusChange,
): void {
	if (!session.escInterruptTimer) return;
	scheduleSettle(session, onStatusChange);
}

export function disarmEscInterrupt(session: Session): void {
	if (!session.escInterruptTimer) return;
	clearTimeout(session.escInterruptTimer);
	session.escInterruptTimer = undefined;
}
