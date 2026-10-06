import { useEffect, useState } from "react";
import type { ItemTracker } from "../../../../../backlog/web/ui/types";
import { useApiNode } from "../../useApiNode";
import { loadItemTrackers } from "../loadItemTrackers";

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
