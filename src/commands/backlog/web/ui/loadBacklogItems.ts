import type { BacklogFilter } from "../parseBacklogFilter";
import { backlogItemsCache } from "./backlogItemsCache";
import { fetchItems } from "./fetchItems";
import type { BacklogItemSummary } from "./types";

export async function loadBacklogItems(
	cwd: string | undefined,
	filter: BacklogFilter,
	signal: AbortSignal,
): Promise<BacklogItemSummary[]> {
	const items = await fetchItems({ cwd, signal, filter });
	if (!signal.aborted) backlogItemsCache.set(cwd, filter, items);
	return items;
}
