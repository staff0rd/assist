import type { BacklogFilter } from "../parseBacklogFilter";
import { backlogExists } from "./backlogExists";
import { backlogItemsCache } from "./backlogItemsCache";
import { fetchItems } from "./fetchItems";
import type { BacklogItemSummary } from "./types";

export async function loadBacklogItems(
	cwd: string | undefined,
	filter: BacklogFilter,
	signal: AbortSignal,
): Promise<{ found: boolean; items: BacklogItemSummary[] }> {
	const found = await backlogExists(cwd, signal);
	const items = found ? await fetchItems({ cwd, signal, filter }) : [];
	if (!signal.aborted) backlogItemsCache.set(cwd, filter, items);
	return { found, items };
}
