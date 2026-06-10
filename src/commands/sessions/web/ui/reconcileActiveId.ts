import type { SessionInfo } from "./types";

export function reconcileActiveId(
	sessions: SessionInfo[],
	activeId: string | null,
): string | null {
	if (activeId === null) return sessions[0]?.id ?? null;
	if (sessions.some((s) => s.id === activeId)) return activeId;
	return sessions[0]?.id ?? null;
}
