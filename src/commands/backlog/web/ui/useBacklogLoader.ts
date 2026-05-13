import { useCallback, useEffect, useState } from "react";
import { fetchBacklogExists, fetchItems } from "./api";
import type { BacklogItem } from "./types";

export function useBacklogLoader(selectedCwd: string) {
	const [items, setItems] = useState<BacklogItem[]>([]);
	const [exists, setExists] = useState<boolean | null>(null);

	const reload = useCallback(async () => {
		const cwd = selectedCwd || undefined;
		console.log("[backlog] reload for cwd:", cwd);
		const backlogExists = await fetchBacklogExists(cwd);
		console.log("[backlog] exists for cwd:", cwd, "→", backlogExists);
		setExists(backlogExists);
		if (backlogExists) {
			const fetched = await fetchItems(undefined, cwd);
			console.log("[backlog] items for cwd:", cwd, "count:", fetched.length);
			setItems(fetched);
		} else {
			setItems([]);
		}
	}, [selectedCwd]);

	useEffect(() => {
		reload();
	}, [reload]);

	return { items, exists, reload };
}
