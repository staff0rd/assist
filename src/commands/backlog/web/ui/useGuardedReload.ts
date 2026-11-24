import { type Dispatch, type SetStateAction, useCallback } from "react";
import type { BacklogFilter } from "../parseBacklogFilter";
import { backlogItemsCache } from "./backlogItemsCache";
import type { OrderGuard } from "./createOrderGuard";
import { fetchItems } from "./fetchItems";
import type { BacklogItemSummary } from "./types";

type ReloadContext = {
	cwd: string | undefined;
	node: string | undefined;
	filter: BacklogFilter;
	guard: OrderGuard;
	setItems: Dispatch<SetStateAction<BacklogItemSummary[]>>;
	setLoading: (loading: boolean) => void;
};

export function useGuardedReload({
	cwd,
	node,
	filter,
	guard,
	setItems,
	setLoading,
}: ReloadContext): () => Promise<void> {
	return useCallback(async () => {
		const isFresh = guard.ticket();
		const next = await fetchItems({ cwd, node, filter });
		if (!isFresh()) return;
		setItems(next);
		backlogItemsCache.set(cwd, filter, next, node);
		setLoading(false);
	}, [cwd, node, filter, guard, setItems, setLoading]);
}
