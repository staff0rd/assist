import type { SessionInfo } from "./types";

/**
 * Resolve the daemon's per-repo selection map to the single card the UI should
 * activate: the most recently selected entry (last in insertion order) whose
 * session is still live. Returns null when none of the selections still exist.
 */
export function resolveActiveId(
	active: Record<string, string>,
	sessions: SessionInfo[],
): string | null {
	const live = new Set(sessions.map((s) => s.id));
	let resolved: string | null = null;
	for (const id of Object.values(active)) if (live.has(id)) resolved = id;
	return resolved;
}
