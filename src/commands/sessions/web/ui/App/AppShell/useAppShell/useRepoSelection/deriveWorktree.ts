import { findActiveSession } from "../../../../findActiveSession";
import type { HistoricalSession, SessionInfo } from "../../../../types";
import { deriveWorktreeCwd } from "./deriveWorktree/deriveWorktreeCwd";

export function deriveWorktree(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
	selected: { cwd: string; node?: string },
): { cwd: string; node?: string } {
	const cwd = deriveWorktreeCwd(activeId, sessions, history, selected.cwd);
	const active = findActiveSession(activeId, sessions, history);
	return { cwd, node: active?.cwd ? active.node : selected.node };
}
