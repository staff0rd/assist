import { useCallback, useEffect, useState } from "react";
import { initBacklog } from "./api";
import { backlogItemsCache } from "./backlogItemsCache";
import { fetchItems } from "./fetchItems";
import { itemsEqual } from "./itemsEqual";
import { startBacklogPolling } from "./startBacklogPolling";
import type { BacklogItemSummary } from "./types";
import { useRepoCwd } from "./useRepoCwd";
import { useShowCompleted } from "./useShowCompleted";

export function useBacklogItems() {
	const cwd = useRepoCwd();
	const [showCompleted] = useShowCompleted();
	const cached = backlogItemsCache.get(cwd, showCompleted);
	const seed = cached ?? [];
	const isMiss = cached === undefined;
	const [items, setItems] = useState<BacklogItemSummary[]>(seed);
	const [loading, setLoading] = useState(isMiss);
	const [exists, setExists] = useState(true);
	const [loadedCwd, setLoadedCwd] = useState(cwd);
	const [loadedShowCompleted, setLoadedShowCompleted] = useState(showCompleted);

	// why: reset during render so the previous key's stale list never commits and loading reflects the new key's cache hit/miss before the effect runs.
	if (cwd !== loadedCwd || showCompleted !== loadedShowCompleted) {
		setLoadedCwd(cwd);
		setLoadedShowCompleted(showCompleted);
		setItems(seed);
		setLoading(isMiss);
		setExists(true);
	}

	const reload = useCallback(async () => {
		const next = await fetchItems({ cwd, showCompleted });
		setItems(next);
		backlogItemsCache.set(cwd, showCompleted, next);
		setLoading(false);
	}, [cwd, showCompleted]);

	useEffect(() => {
		setExists(true);
		return startBacklogPolling(cwd, showCompleted, (found, next) => {
			setExists(found);
			setItems((prev) => (itemsEqual(prev, next) ? prev : next));
			setLoading(false);
		});
	}, [cwd, showCompleted]);

	const initialize = useCallback(async () => {
		await initBacklog(cwd);
		setExists(true);
		setLoading(true);
		await reload();
	}, [cwd, reload]);

	return { items, loading, exists, reload, initialize };
}
