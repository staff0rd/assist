import { eq } from "drizzle-orm";
import { items } from "../../shared/db/schema";
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

/**
 * Cheaply test whether the current repo has any backlog items, without loading
 * the items themselves or their relations — a single `LIMIT 1` probe. Used by the
 * web view's existence check, which previously loaded the whole backlog.
 */
export async function backlogHasItems(): Promise<boolean> {
	const { orm } = await getReady();
	const [row] = await orm
		.select({ id: items.id })
		.from(items)
		.where(eq(items.origin, getOrigin()))
		.limit(1);
	return row !== undefined;
}
