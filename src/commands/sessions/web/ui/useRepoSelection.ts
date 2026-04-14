import { useEffect, useMemo, useState } from "react";
import type { HistoricalSession } from "./types";
import { uniqueRepos } from "./uniqueRepos";

export function useRepoSelection(
	currentCwd: string,
	history: HistoricalSession[],
) {
	const [selectedCwd, setSelectedCwd] = useState(currentCwd);

	useEffect(() => {
		if (currentCwd && !selectedCwd) setSelectedCwd(currentCwd);
	}, [currentCwd, selectedCwd]);

	const repos = useMemo(
		() => uniqueRepos(currentCwd, history),
		[currentCwd, history],
	);

	return { repos, selectedCwd, setSelectedCwd };
}
