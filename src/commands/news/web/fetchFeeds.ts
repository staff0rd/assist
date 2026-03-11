import { parseFeed } from "./parseFeed";
import type { FeedItem } from "./shared";

export async function fetchFeeds(
	urls: string[],
	onProgress?: (done: number, total: number) => void,
): Promise<FeedItem[]> {
	let done = 0;
	const results = await Promise.allSettled(
		urls.map(async (url) => {
			const origin = new URL(url).origin;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const items = parseFeed(await res.text(), origin);
			done++;
			onProgress?.(done, urls.length);
			return items;
		}),
	);

	const items: FeedItem[] = [];
	for (const result of results) {
		if (result.status === "fulfilled") {
			items.push(...result.value);
		}
	}

	items.sort(
		(a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
	);
	return items;
}
