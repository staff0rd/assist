import type { SessionInfo } from "../types";

/* why: a terminal/error session never emits the first output that clears the
 * "Starting…" indicator, so only treat in-flight sessions as loading — a
 * done/error card (e.g. a restored update or unresumable session) must not hang
 * on the overlay (#396, #420). */
export function isSessionStarting(
	session: SessionInfo,
	initialized: Set<string>,
): boolean {
	// why: an SDK session has no terminal output to mark it initialized; the daemon reports sdk only once its query process exists
	if (session.sdk) return false;
	return (
		!initialized.has(session.id) &&
		session.status !== "done" &&
		session.status !== "error" &&
		session.status !== "stopped"
	);
}
