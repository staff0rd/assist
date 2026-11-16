import { useMemo } from "react";
import type { SessionInfo } from "../../types";
import { needsAttention } from "../groupSessionsByStatus";
import { buildRepoChips } from "./buildRepoChips";
import { filterByRepo } from "./filterByRepo";
import { usePhoneRepoFilter } from "./usePhoneRepoFilter";

export function useSessionRepoFilter(sessions: SessionInfo[]) {
	const [repo, selectRepo] = usePhoneRepoFilter();
	const chips = useMemo(
		() => buildRepoChips(sessions, repo, needsAttention),
		[sessions, repo],
	);
	const shown = useMemo(() => filterByRepo(sessions, repo), [sessions, repo]);
	return { repo, selectRepo, chips, shown };
}
