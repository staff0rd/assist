import { useCallback, useEffect, useState } from "react";
import { initBacklog } from "./api";
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
	const [exists, setExists] = useState(true);
	const [loadedCwd, setLoadedCwd] = useState(cwd);
	const [loadedFilter, setLoadedFilter] = useState(filter);

	// why: reset during render so the previous key's stale list never commits and loading reflects the new key's cache hit/miss before the effect runs.
	if (cwd !== loadedCwd || filter !== loadedFilter) {
		setLoadedCwd(cwd);
		setLoadedFilter(filter);
		setItems(seed);
		setLoading(isMiss);
		setExists(true);
	}

	const reload = useCallback(async () => {
		const next = await fetchItems({ cwd, filter });
		setItems(next);
		backlogItemsCache.set(cwd, filter, next);
		setLoading(false);
	}, [cwd, filter]);

	useEffect(() => {
		setExists(true);
		return startBacklogPolling(cwd, filter, (found, next) => {
			setExists(found);
			setItems((prev) => (itemsEqual(prev, next) ? prev : next));
			setLoading(false);
		});
	}, [cwd, filter]);

	const initialize = useCallback(async () => {
		await initBacklog(cwd);
		setExists(true);
		setLoading(true);
		await reload();
	}, [cwd, reload]);

	return { items, loading, exists, reload, initialize };
}
