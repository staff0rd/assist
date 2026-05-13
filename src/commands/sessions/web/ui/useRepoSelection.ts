import { useEffect, useMemo, useState } from "react";
import type { HistoricalSession } from "./types";
import { uniqueRepos } from "./uniqueRepos";

export function useRepoSelection(
	currentCwd: string,
	history: HistoricalSession[],
) {
	const [selectedCwd, setSelectedCwdState] = useState(currentCwd);

	const setSelectedCwd = (cwd: string) => {
		console.log("[repo] setSelectedCwd:", cwd);
		setSelectedCwdState(cwd);
	};

	useEffect(() => {
		if (currentCwd && !selectedCwd) {
			console.log("[repo] init selectedCwd from currentCwd:", currentCwd);
			setSelectedCwdState(currentCwd);
		}
	}, [currentCwd, selectedCwd]);

	const repos = useMemo(
		() => uniqueRepos(currentCwd, history),
		[currentCwd, history],
	);

	return { repos, selectedCwd, setSelectedCwd };
}
