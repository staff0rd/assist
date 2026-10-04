import type { Session } from "./types";

const NUDGE_RESTORE_MS = 50;

/* why: a takeover at the PTY's current size raises no SIGWINCH, so the harness
 * never repaints for the new viewer; bounce the width to force a redraw. */
export function nudgePty(
	session: Session,
	resize: (cols: number, rows: number) => void,
): void {
	const { cols, rows } = session;
	if (!cols || !rows || cols < 2) return;
	resize(cols - 1, rows);
	setTimeout(() => {
		if (session.cols === cols && session.rows === rows) resize(cols, rows);
	}, NUDGE_RESTORE_MS);
}
