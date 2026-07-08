import { useEffect, useState } from "react";
import type { BacklogItemSummary } from "../../../backlog/web/ui/types";
import { withCwd } from "../../../backlog/web/ui/withCwd";

const cache = new Map<string, Promise<Map<number, string>>>();

function loadJiraKeys(cwd: string | undefined): Promise<Map<number, string>> {
	const key = cwd ?? "";
	let pending = cache.get(key);
	if (!pending) {
		pending = (async () => {
			const res = await fetch(withCwd("/api/items", cwd));
			const items = (await res.json()) as BacklogItemSummary[];
			const map = new Map<number, string>();
			for (const item of items) {
				if (item.jiraKey) map.set(item.id, item.jiraKey);
			}
			return map;
		})().catch(() => new Map<number, string>());
		cache.set(key, pending);
	}
	return pending;
}

export function useJiraKeys(
	cwd: string | undefined,
): (itemId: number | undefined) => string | undefined {
	const [keys, setKeys] = useState<Map<number, string>>(() => new Map());

	useEffect(() => {
		let cancelled = false;
		loadJiraKeys(cwd).then((map) => {
			if (!cancelled) setKeys(map);
		});
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return (itemId) => (itemId == null ? undefined : keys.get(itemId));
}
