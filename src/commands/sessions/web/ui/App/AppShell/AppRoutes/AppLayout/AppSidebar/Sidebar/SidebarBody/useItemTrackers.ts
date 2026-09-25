import { useEffect, useState } from "react";
import type {
	BacklogItemSummary,
	ItemTracker,
} from "../../../../../../../../../../backlog/web/ui/types";
import { withCwd } from "../../../../../../../../../../backlog/web/ui/withCwd";

const cache = new Map<string, Promise<Map<number, ItemTracker>>>();

function loadItemTrackers(
	cwd: string | undefined,
): Promise<Map<number, ItemTracker>> {
	const key = cwd ?? "";
	let pending = cache.get(key);
	if (!pending) {
		pending = (async () => {
			const res = await fetch(withCwd("/api/items", cwd));
			const items = (await res.json()) as BacklogItemSummary[];
			const map = new Map<number, ItemTracker>();
			for (const item of items) {
				if (!item.jiraKey && !item.githubIssue) continue;
				map.set(item.id, {
					jiraKey: item.jiraKey,
					githubIssue: item.githubIssue,
					origin: item.origin,
				});
			}
			return map;
		})().catch(() => new Map<number, ItemTracker>());
		cache.set(key, pending);
	}
	return pending;
}

export function useItemTrackers(
	cwd: string | undefined,
): (itemId: number | undefined) => ItemTracker | undefined {
	const [trackers, setTrackers] = useState<Map<number, ItemTracker>>(
		() => new Map(),
	);

	useEffect(() => {
		let cancelled = false;
		loadItemTrackers(cwd).then((map) => {
			if (!cancelled) setTrackers(map);
		});
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return (itemId) => (itemId == null ? undefined : trackers.get(itemId));
}
