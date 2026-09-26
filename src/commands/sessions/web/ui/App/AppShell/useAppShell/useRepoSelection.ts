import { useEffect, useMemo, useState } from "react";
import { deriveWorktreeCwd } from "./useRepoSelection/deriveWorktreeCwd";
import type { HistoricalSession, SessionInfo } from "../../../types";
import { linkedNodeRepos } from "./useRepoSelection/linkedNodeRepos";
import { uniqueRepos } from "./useRepoSelection/uniqueRepos";
import type { RepoSelection } from "../../../useRepoSelectionContext";
import { useSyncRepoToActiveCard } from "./useRepoSelection/useSyncRepoToActiveCard";

export function useRepoSelection(
	currentCwd: string,
	history: HistoricalSession[],
	activeId: string | null,
	sessions: SessionInfo[],
): RepoSelection {
	const [selectedCwd, setSelectedCwd] = useState(currentCwd);

	useEffect(() => {
		if (currentCwd && !selectedCwd) setSelectedCwd(currentCwd);
	}, [currentCwd, selectedCwd]);

	useSyncRepoToActiveCard(activeId, sessions, history, setSelectedCwd);

	const repos = useMemo(
		() =>
			uniqueRepos(
				currentCwd,
				history.filter((s) => !s.node),
			),
		[currentCwd, history],
	);
	const reposByNode = useMemo(() => linkedNodeRepos(history), [history]);

	const worktreeCwd = deriveWorktreeCwd(
		activeId,
		sessions,
		history,
		selectedCwd,
	);

	// Stable identity so RepoSelectionContext consumers only re-render when
	// the selection actually changes, not on every socket state update
	return useMemo(
		() => ({ repos, reposByNode, selectedCwd, worktreeCwd, setSelectedCwd }),
		[repos, reposByNode, selectedCwd, worktreeCwd],
	);
}
