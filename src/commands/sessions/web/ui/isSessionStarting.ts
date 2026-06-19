import type { SessionInfo } from "./types";

/* why: a terminal/error session never emits the first output that clears the
 * "Starting…" indicator, so only treat in-flight sessions as loading — a
 * done/error card (e.g. a restored update or unresumable session) must not hang
 * on the overlay (#396, #420). */
export function isSessionStarting(
	session: SessionInfo,
	initialized: Set<string>,
): boolean {
	return (
		!initialized.has(session.id) &&
		session.status !== "done" &&
		session.status !== "error"
	);
}
