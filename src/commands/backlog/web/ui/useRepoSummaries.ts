import { useEffect, useState } from "react";
import { useRepoSelectionContext } from "../../../sessions/web/ui/useRepoSelectionContext";
import { fetchRepoSummaries, type RepoSummary } from "./fetchRepoSummaries";

export function useRepoSummaries(): RepoSummary[] {
	const { repos, selectedCwd } = useRepoSelectionContext();
	const [summaries, setSummaries] = useState<RepoSummary[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		fetchRepoSummaries({
			cwd: selectedCwd || undefined,
			knownCwds: repos,
			signal: controller.signal,
		})
			.then(setSummaries)
			.catch(() => {});
		return () => controller.abort();
	}, [repos, selectedCwd]);

	return summaries;
}
