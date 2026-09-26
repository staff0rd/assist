import type { BacklogFilter } from "../parseBacklogFilter";
import type { BacklogItemSummary } from "./types";

const cache = new Map<string, BacklogItemSummary[]>();

function cacheKey(
	cwd: string | undefined,
	filter: BacklogFilter,
	node: string | undefined,
): string {
	return JSON.stringify([cwd ?? null, filter, node ?? null]);
}

export const backlogItemsCache = {
	get(
		cwd: string | undefined,
		filter: BacklogFilter,
		node?: string,
	): BacklogItemSummary[] | undefined {
		return cache.get(cacheKey(cwd, filter, node));
	},
	set(
		cwd: string | undefined,
		filter: BacklogFilter,
		items: BacklogItemSummary[],
		node?: string,
	): void {
		cache.set(cacheKey(cwd, filter, node), items);
	},
};
