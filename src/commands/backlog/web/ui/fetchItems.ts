import type { BacklogItem } from "./types";
import { withCwd } from "./withCwd";

function itemsUrl(query?: string): string {
	return query ? `/api/items?q=${encodeURIComponent(query)}` : "/api/items";
}

export async function fetchItems(
	query?: string,
	cwd?: string,
	signal?: AbortSignal,
): Promise<BacklogItem[]> {
	const res = await fetch(withCwd(itemsUrl(query), cwd), { signal });
	return res.json();
}
