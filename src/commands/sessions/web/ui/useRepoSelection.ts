import { useEffect, useMemo, useState } from "react";
import type { HistoricalSession } from "./types";
import { uniqueRepos } from "./uniqueRepos";
import type { RepoSelection } from "./useRepoSelectionContext";

export function useRepoSelection(
	currentCwd: string,
	history: HistoricalSession[],
): RepoSelection {
	const [selectedCwd, setSelectedCwd] = useState(currentCwd);

	useEffect(() => {
		if (currentCwd && !selectedCwd) setSelectedCwd(currentCwd);
	}, [currentCwd, selectedCwd]);

	const repos = useMemo(
		() => uniqueRepos(currentCwd, history),
		[currentCwd, history],
	);

	// Stable identity so RepoSelectionContext consumers only re-render when
	// the selection actually changes, not on every socket state update
	return useMemo(
		() => ({ repos, selectedCwd, setSelectedCwd }),
		[repos, selectedCwd],
	);
}
