import { useEffect, useState } from "react";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useAutopilotRepos } from "./useAutopilotRepos";

/* why: the tab shows whenever any repo has autopilot, so open on the selected
 * repo when it has a schedule and otherwise on the first repo that does. */
export function useAutopilotCwd(selectedUnscheduled: boolean) {
	const { selectedCwd } = useRepoSelectionContext();
	const repos = useAutopilotRepos();
	const [picked, setPicked] = useState<{ from: string; cwd: string }>();
	const current = picked?.from === selectedCwd ? picked.cwd : selectedCwd;

	useEffect(() => {
		if (selectedUnscheduled && current === selectedCwd && repos[0])
			setPicked({ from: selectedCwd, cwd: repos[0] });
	}, [selectedUnscheduled, current, selectedCwd, repos]);

	return {
		cwd: current,
		repos,
		pick: (cwd: string) => setPicked({ from: selectedCwd, cwd }),
	};
}
