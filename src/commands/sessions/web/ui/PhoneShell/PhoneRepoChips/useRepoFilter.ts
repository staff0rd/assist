import { useMemo } from "react";
import type { Grouped } from "../../repoGroupKey";
import { buildRepoChips } from "./buildRepoChips";
import { filterByRepo } from "./filterByRepo";
import { usePhoneRepoFilter } from "./usePhoneRepoFilter";

export function useRepoFilter<T extends Grouped>(
	items: T[],
	needsAttention?: (item: T) => boolean,
) {
	const [repo, selectRepo] = usePhoneRepoFilter();
	const chips = useMemo(
		() => buildRepoChips(items, repo, needsAttention),
		[items, repo, needsAttention],
	);
	const shown = useMemo(() => filterByRepo(items, repo), [items, repo]);
	return { repo, selectRepo, chips, shown };
}
