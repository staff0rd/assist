import { useCallback, useEffect, useState } from "react";
import { backlogExists, fetchItems, initBacklog } from "./api";
import type { BacklogItem } from "./types";
import { useRepoCwd } from "./useRepoCwd";

export function useBacklogItems() {
	const cwd = useRepoCwd();
	const [items, setItems] = useState<BacklogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [exists, setExists] = useState(true);

	const reload = useCallback(async () => {
		setItems(await fetchItems(undefined, cwd));
		setLoading(false);
	}, [cwd]);

	useEffect(() => {
		setLoading(true);
		setExists(true);
		(async () => {
			if (await backlogExists(cwd)) {
				await reload();
				return;
			}
			setExists(false);
			setItems([]);
			setLoading(false);
		})();
	}, [cwd, reload]);

	const initialize = useCallback(async () => {
		await initBacklog(cwd);
		setExists(true);
		setLoading(true);
		await reload();
	}, [cwd, reload]);

	return { items, loading, exists, reload, initialize };
}
