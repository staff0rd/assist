import type { FeedItem } from "./types";

export async function fetchItems(): Promise<FeedItem[]> {
	const res = await fetch("/api/items");
	return res.json();
}
