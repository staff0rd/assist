import type { HistoricalSession, SessionInfo } from "./types";

export function deriveActiveCwd(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
): string | undefined {
	if (!activeId) return undefined;
	const live = sessions.find((s) => s.id === activeId);
	if (live) return live.cwd;
	const past = history.find((h) => h.sessionId === activeId);
	return past?.cwd;
}
