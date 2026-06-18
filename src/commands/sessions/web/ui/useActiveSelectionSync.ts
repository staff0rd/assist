import { useEffect } from "react";
import { deriveActiveCwd } from "./deriveActiveCwd";
import type { HistoricalSession, SessionInfo } from "./types";

/**
 * Mirror the active card to the daemon whenever it changes, keyed by the card's
 * own repo cwd, so the selection persists per-repo and is shared with other
 * browsers. Covers card clicks and the auto-select of a newly created session.
 */
export function useActiveSelectionSync(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
	send: (msg: object) => void,
): void {
	const cwd = deriveActiveCwd(activeId, sessions, history);
	useEffect(() => {
		if (activeId && cwd) send({ type: "set-active", cwd, sessionId: activeId });
	}, [activeId, cwd, send]);
}
