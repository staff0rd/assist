import { useEffect } from "react";
import { deriveActiveCwd } from "../../../../deriveActiveCwd";
import { findActiveSession } from "../../../../findActiveSession";
import type { HistoricalSession, SessionInfo } from "../../../../types";
import { LOCAL_NODE } from "./mergeRepos";

export function useSyncRepoToActiveCard(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
	setSelectedCwd: (cwd: string, node?: string) => void,
): void {
	const activeCwd = deriveActiveCwd(activeId, sessions, history);
	const activeNode =
		findActiveSession(activeId, sessions, history)?.node ?? LOCAL_NODE;
	useEffect(() => {
		if (activeCwd) setSelectedCwd(activeCwd, activeNode);
	}, [activeCwd, activeNode, setSelectedCwd]);
}
