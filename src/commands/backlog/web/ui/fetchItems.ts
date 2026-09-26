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
	node?: string;
	signal?: AbortSignal;
	filter?: BacklogFilter;
};

export async function fetchItems({
	query,
	cwd,
	node,
	signal,
	filter,
}: FetchItemsOptions = {}): Promise<BacklogItemSummary[]> {
	const res = await fetch(withCwd(itemsUrl(query, filter), cwd, node), {
		signal,
	});
	return res.json();
}
