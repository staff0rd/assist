import { useEffect, useState } from "react";
import type {
	BacklogItemSummary,
	ItemTracker,
} from "../../../../../backlog/web/ui/types";
import { withCwd } from "../../../../../backlog/web/ui/withCwd";
import { useApiNode } from "../../useApiNode";

const cache = new Map<string, Promise<Map<number, ItemTracker>>>();

function loadItemTrackers(
	cwd: string | undefined,
	node: string | undefined,
): Promise<Map<number, ItemTracker>> {
	const key = `${node ?? ""}\0${cwd ?? ""}`;
	let pending = cache.get(key);
	if (!pending) {
		pending = (async () => {
			const res = await fetch(withCwd("/api/items", cwd, node));
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
	const node = useApiNode();

	useEffect(() => {
		let cancelled = false;
		loadItemTrackers(cwd, node).then((map) => {
			if (!cancelled) setTrackers(map);
		});
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	return (itemId) => (itemId == null ? undefined : trackers.get(itemId));
}
