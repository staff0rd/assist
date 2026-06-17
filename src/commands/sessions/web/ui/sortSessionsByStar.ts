import type { SessionInfo } from "./types";

/**
 * Pin sessions whose backlog item is starred ahead of the rest, preserving the
 * incoming order within each group (a stable partition).
 */
export function sortSessionsByStar(
	sessions: SessionInfo[],
	isStarred: (session: SessionInfo) => boolean,
): SessionInfo[] {
	return [
		...sessions.filter((s) => isStarred(s)),
		...sessions.filter((s) => !isStarred(s)),
	];
}
