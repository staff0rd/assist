import { useEffect, useState } from "react";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import type { HistoricalSession } from "../types";
import { fetchCloneBaseRepos } from "./useCloneBaseRepos/fetchCloneBaseRepos";

export function useCloneBaseRepos(history: HistoricalSession[]): string[] {
	const [repos, setRepos] = useState<string[]>([]);

	useEffect(() => {
		// Refetch whenever history refreshes so newly cloned repos appear.
		void history;
		const controller = new AbortController();
		fetchCloneBaseRepos(controller.signal)
			.then(setRepos)
			.catch((error: unknown) => {
				if (!controller.signal.aborted)
					reportCaughtError(error, "clone base repos");
			});
		return () => controller.abort();
	}, [history]);

	return repos;
}
