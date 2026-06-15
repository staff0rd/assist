import type { FeedItem } from "./types";

export type DateGroup = { label: string; items: FeedItem[] };

function formatLabel(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
}

function dateKey(dateStr: string): string {
	return new Date(dateStr).toISOString().slice(0, 10);
}

export function groupByDate(items: FeedItem[]): DateGroup[] {
	const map = new Map<string, DateGroup>();
	for (const item of items) {
		const key = dateKey(item.pubDate);
		const existing = map.get(key);
		if (existing) {
			existing.items.push(item);
		} else {
			map.set(key, { label: formatLabel(item.pubDate), items: [item] });
		}
	}
	return [...map.values()];
}
