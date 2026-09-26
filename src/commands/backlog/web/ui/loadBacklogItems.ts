import type { BacklogFilter } from "../parseBacklogFilter";
import { backlogItemsCache } from "./backlogItemsCache";
import { fetchItems } from "./fetchItems";
import type { BacklogItemSummary } from "./types";

export async function loadBacklogItems(
	cwd: string | undefined,
	filter: BacklogFilter,
	signal: AbortSignal,
	node?: string,
): Promise<BacklogItemSummary[]> {
	const items = await fetchItems({ cwd, node, signal, filter });
	if (!signal.aborted) backlogItemsCache.set(cwd, filter, items, node);
	return items;
}
