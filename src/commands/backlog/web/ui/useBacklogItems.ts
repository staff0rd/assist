import { useCallback, useEffect, useState } from "react";
import { useApiNode } from "../../../sessions/web/ui/useApiNode";
import { backlogItemsCache } from "./backlogItemsCache";
import { fetchItems } from "./fetchItems";
import { itemsEqual } from "./itemsEqual";
import { startBacklogPolling } from "./startBacklogPolling";
import type { BacklogItemSummary } from "./types";
import { useBacklogFilter } from "./useBacklogFilter";
import { useRepoCwd } from "./useRepoCwd";

export function useBacklogItems() {
	const cwd = useRepoCwd();
	const node = useApiNode();
	const [filter] = useBacklogFilter();
	const cached = backlogItemsCache.get(cwd, filter, node);
	const seed = cached ?? [];
	const isMiss = cached === undefined;
	const [items, setItems] = useState<BacklogItemSummary[]>(seed);
	const [loading, setLoading] = useState(isMiss);
	const [loadedCwd, setLoadedCwd] = useState(cwd);
	const [loadedNode, setLoadedNode] = useState(node);
	const [loadedFilter, setLoadedFilter] = useState(filter);

	// why: reset during render so the previous key's stale list never commits and loading reflects the new key's cache hit/miss before the effect runs.
	if (cwd !== loadedCwd || node !== loadedNode || filter !== loadedFilter) {
		setLoadedCwd(cwd);
		setLoadedNode(node);
		setLoadedFilter(filter);
		setItems(seed);
		setLoading(isMiss);
	}

	const reload = useCallback(async () => {
		const next = await fetchItems({ cwd, node, filter });
		setItems(next);
		backlogItemsCache.set(cwd, filter, next, node);
		setLoading(false);
	}, [cwd, node, filter]);

	useEffect(
		() =>
			startBacklogPolling(
				cwd,
				filter,
				(next) => {
					setItems((prev) => (itemsEqual(prev, next) ? prev : next));
					setLoading(false);
				},
				node,
			),
		[cwd, node, filter],
	);

	return { items, loading, reload };
}
