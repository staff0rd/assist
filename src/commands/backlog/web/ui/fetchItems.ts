import type { BacklogFilter } from "../parseBacklogFilter";
import type { BacklogItemSummary } from "./types";
import { withCwd } from "./withCwd";

function itemsUrl(query?: string, filter?: BacklogFilter): string {
	const params = new URLSearchParams();
	if (query) params.set("q", query);
	if (filter && filter !== "todo") params.set("filter", filter);
	const qs = params.toString();
	return qs ? `/api/items?${qs}` : "/api/items";
}

type FetchItemsOptions = {
	query?: string;
	cwd?: string;
	signal?: AbortSignal;
	filter?: BacklogFilter;
};

export async function fetchItems({
	query,
	cwd,
	signal,
	filter,
}: FetchItemsOptions = {}): Promise<BacklogItemSummary[]> {
	const res = await fetch(withCwd(itemsUrl(query, filter), cwd), {
		signal,
	});
	return res.json();
}
