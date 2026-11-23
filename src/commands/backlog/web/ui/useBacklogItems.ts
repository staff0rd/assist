import { useEffect, useState } from "react";
import { useApiNode } from "../../../sessions/web/ui/useApiNode";
import { backlogItemsCache } from "./backlogItemsCache";
import { backlogLoadHandlers } from "./backlogLoadHandlers";
import { startBacklogPolling } from "./startBacklogPolling";
import type { BacklogItemSummary } from "./types";
import { useBacklogFilter } from "./useBacklogFilter";
import { useGuardedReload } from "./useGuardedReload";
import { useOptimisticMove } from "./useOptimisticMove";
import { useOrderGuard } from "./useOrderGuard";
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
	const [error, setError] = useState<string | null>(null);
	const [loadedCwd, setLoadedCwd] = useState(cwd);
	const [loadedNode, setLoadedNode] = useState(node);
	const [loadedFilter, setLoadedFilter] = useState(filter);
	const guard = useOrderGuard();

	// why: reset during render so the previous key's stale list never commits and loading reflects the new key's cache hit/miss before the effect runs.
	if (cwd !== loadedCwd || node !== loadedNode || filter !== loadedFilter) {
		setLoadedCwd(cwd);
		setLoadedNode(node);
		setLoadedFilter(filter);
		setItems(seed);
		setLoading(isMiss);
		setError(null);
	}

	const scope = { cwd, node, filter, guard, setItems };
	const reload = useGuardedReload({ ...scope, setLoading });
	const move = useOptimisticMove({ ...scope, setError, reload });

	useEffect(
		() =>
			startBacklogPolling(
				cwd,
				filter,
				backlogLoadHandlers({
					setItems,
					setLoading,
					setError,
					ticket: guard.ticket,
				}),
				node,
			),
		[cwd, node, filter, guard],
	);

	return { items, loading, error, reload, move };
}
