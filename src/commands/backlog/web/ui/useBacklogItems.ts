import { useCallback, useEffect, useState } from "react";
import { backlogItemsCache } from "./backlogItemsCache";
import { fetchItems } from "./fetchItems";
import { itemsEqual } from "./itemsEqual";
import { startBacklogPolling } from "./startBacklogPolling";
import type { BacklogItemSummary } from "./types";
import { useBacklogFilter } from "./useBacklogFilter";
import { useRepoCwd } from "./useRepoCwd";

export function useBacklogItems() {
	const cwd = useRepoCwd();
	const [filter] = useBacklogFilter();
	const cached = backlogItemsCache.get(cwd, filter);
	const seed = cached ?? [];
	const isMiss = cached === undefined;
	const [items, setItems] = useState<BacklogItemSummary[]>(seed);
	const [loading, setLoading] = useState(isMiss);
	const [loadedCwd, setLoadedCwd] = useState(cwd);
	const [loadedFilter, setLoadedFilter] = useState(filter);

	// why: reset during render so the previous key's stale list never commits and loading reflects the new key's cache hit/miss before the effect runs.
	if (cwd !== loadedCwd || filter !== loadedFilter) {
		setLoadedCwd(cwd);
		setLoadedFilter(filter);
		setItems(seed);
		setLoading(isMiss);
	}

	const reload = useCallback(async () => {
		const next = await fetchItems({ cwd, filter });
		setItems(next);
		backlogItemsCache.set(cwd, filter, next);
		setLoading(false);
	}, [cwd, filter]);

	useEffect(
		() =>
			startBacklogPolling(cwd, filter, (next) => {
				setItems((prev) => (itemsEqual(prev, next) ? prev : next));
				setLoading(false);
			}),
		[cwd, filter],
	);

	return { items, loading, reload };
}
