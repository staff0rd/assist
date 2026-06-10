import type { BacklogItemSummary } from "./types";

const cache = new Map<string, BacklogItemSummary[]>();

function cacheKey(cwd: string | undefined, showCompleted: boolean): string {
	return JSON.stringify([cwd ?? null, showCompleted]);
}

export const backlogItemsCache = {
	get(
		cwd: string | undefined,
		showCompleted: boolean,
	): BacklogItemSummary[] | undefined {
		return cache.get(cacheKey(cwd, showCompleted));
	},
	set(
		cwd: string | undefined,
		showCompleted: boolean,
		items: BacklogItemSummary[],
	): void {
		cache.set(cacheKey(cwd, showCompleted), items);
	},
};
