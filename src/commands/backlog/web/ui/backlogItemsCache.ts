import type { BacklogFilter } from "../parseBacklogFilter";
import type { BacklogItemSummary } from "./types";

const cache = new Map<string, BacklogItemSummary[]>();

function cacheKey(cwd: string | undefined, filter: BacklogFilter): string {
	return JSON.stringify([cwd ?? null, filter]);
}

export const backlogItemsCache = {
	get(
		cwd: string | undefined,
		filter: BacklogFilter,
	): BacklogItemSummary[] | undefined {
		return cache.get(cacheKey(cwd, filter));
	},
	set(
		cwd: string | undefined,
		filter: BacklogFilter,
		items: BacklogItemSummary[],
	): void {
		cache.set(cacheKey(cwd, filter), items);
	},
};
