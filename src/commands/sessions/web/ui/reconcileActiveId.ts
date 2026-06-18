import type { SessionInfo } from "./types";

export function reconcileActiveId(
	sessions: SessionInfo[],
	activeId: string | null,
	daemonActiveId: string | null = null,
): string | null {
	if (activeId !== null)
		return sessions.some((s) => s.id === activeId)
			? activeId
			: (sessions[0]?.id ?? null);
	// why: with no local choice, adopt the daemon's per-repo selection when it still exists, else fall back to the first card
	if (daemonActiveId && sessions.some((s) => s.id === daemonActiveId))
		return daemonActiveId;
	return sessions[0]?.id ?? null;
}
