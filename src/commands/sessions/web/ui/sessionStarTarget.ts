import type { SessionInfo } from "./types";

type SessionStarTarget = { cwd: string; itemId: number };

/**
 * The backlog item a session can star, or undefined when the session isn't
 * building one (no cwd, not a backlog run, or no item id).
 */
export function sessionStarTarget(
	session: SessionInfo,
): SessionStarTarget | undefined {
	const itemId = session.activity?.itemId;
	if (!session.cwd || session.activity?.kind !== "backlog" || itemId == null) {
		return undefined;
	}
	return { cwd: session.cwd, itemId };
}

export function starTargetKey(cwd: string, itemId: number): string {
	return `${cwd}::${itemId}`;
}
