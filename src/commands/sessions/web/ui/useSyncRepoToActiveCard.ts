import { useEffect } from "react";
import { deriveActiveCwd } from "./deriveActiveCwd";
import type { HistoricalSession, SessionInfo } from "./types";

export function useSyncRepoToActiveCard(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
	setSelectedCwd: (cwd: string) => void,
): void {
	const activeCwd = deriveActiveCwd(activeId, sessions, history);
	useEffect(() => {
		if (activeCwd) setSelectedCwd(activeCwd);
	}, [activeCwd, setSelectedCwd]);
}
