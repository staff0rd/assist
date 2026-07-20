import { loadItemSummaries } from "./loadItemSummaries";
import { searchItemIds } from "./searchItemIds";
import { getOrigin, getReady } from "./shared";
import type { BacklogItemSummary } from "./types";

/**
 * Lightweight counterpart to {@link ./shared.loadBacklog} for the web list:
 * summary columns only, no relations loaded.
 */
export async function loadBacklogSummaries(
	allRepos = false,
): Promise<BacklogItemSummary[]> {
	const { orm } = await getReady();
	return loadItemSummaries(orm, allRepos ? undefined : getOrigin());
}

/**
 * Lightweight counterpart to {@link ./shared.searchBacklog}: resolves matching
 * ids, then returns only the summary columns for those items.
 */
export async function searchBacklogSummaries(
	query: string,
): Promise<BacklogItemSummary[]> {
	const { orm } = await getReady();
	const origin = getOrigin();
	const ids = await searchItemIds(orm, query, origin);
	const summaries = await loadItemSummaries(orm, origin);
	return summaries.filter((item) => ids.includes(item.id));
}
