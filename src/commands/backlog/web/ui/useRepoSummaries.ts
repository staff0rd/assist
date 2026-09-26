import { useEffect, useMemo, useState } from "react";
import { useMachineNode } from "../../../sessions/web/ui/useMachineNode";
import { useRepoSelectionContext } from "../../../sessions/web/ui/useRepoSelectionContext";
import { fetchRepoSummaries, type RepoSummary } from "./fetchRepoSummaries";

export function useRepoSummaries(): {
	summaries: RepoSummary[];
	node: string | undefined;
} {
	const { repos, selectedCwd, cloneOn } = useRepoSelectionContext();
	const node = useMachineNode();
	const [summaries, setSummaries] = useState<RepoSummary[]>([]);
	const knownCwds = useMemo(
		() =>
			repos
				.map((cwd) => cloneOn(cwd, node))
				.filter((cwd): cwd is string => Boolean(cwd)),
		[repos, cloneOn, node],
	);
	const cwd = selectedCwd ? cloneOn(selectedCwd, node) : undefined;

	useEffect(() => {
		const controller = new AbortController();
		fetchRepoSummaries({ cwd, node, knownCwds, signal: controller.signal })
			.then(setSummaries)
			.catch(() => {});
		return () => controller.abort();
	}, [knownCwds, cwd, node]);

	return { summaries, node };
}
