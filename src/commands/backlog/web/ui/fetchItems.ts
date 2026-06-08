import type { BacklogItem } from "./types";
import { withCwd } from "./withCwd";

function itemsUrl(query?: string, showCompleted?: boolean): string {
	const params = new URLSearchParams();
	if (query) params.set("q", query);
	if (showCompleted) params.set("showCompleted", "true");
	const qs = params.toString();
	return qs ? `/api/items?${qs}` : "/api/items";
}

type FetchItemsOptions = {
	query?: string;
	cwd?: string;
	signal?: AbortSignal;
	showCompleted?: boolean;
};

export async function fetchItems({
	query,
	cwd,
	signal,
	showCompleted,
}: FetchItemsOptions = {}): Promise<BacklogItem[]> {
	const res = await fetch(withCwd(itemsUrl(query, showCompleted), cwd), {
		signal,
	});
	return res.json();
}
