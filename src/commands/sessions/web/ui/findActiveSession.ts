import type { RepoGroup } from "../../shared/RepoGroup";
import type { HistoricalSession, SessionInfo } from "./types";

type ActiveSession = { cwd?: string; repoGroup?: RepoGroup; node?: string };

export function findActiveSession(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
): ActiveSession | undefined {
	if (!activeId) return undefined;
	return (
		sessions.find((s) => s.id === activeId) ??
		history.find((h) => h.sessionId === activeId)
	);
}
