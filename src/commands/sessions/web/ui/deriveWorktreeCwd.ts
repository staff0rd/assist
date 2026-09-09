import { findActiveSession } from "./findActiveSession";
import type { HistoricalSession, SessionInfo } from "./types";

export function deriveWorktreeCwd(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
	selectedCwd: string,
): string {
	const active = findActiveSession(activeId, sessions, history);
	return active?.cwd || selectedCwd;
}
