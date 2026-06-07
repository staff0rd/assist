import { useCallback, useEffect, useState } from "react";
import { initBacklog } from "./api";
import { backlogExists } from "./backlogExists";
import { fetchItems } from "./fetchItems";
import type { BacklogItem } from "./types";
import { useRepoCwd } from "./useRepoCwd";

export function useBacklogItems() {
	const cwd = useRepoCwd();
	const [items, setItems] = useState<BacklogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [exists, setExists] = useState(true);
	const [loadedCwd, setLoadedCwd] = useState(cwd);

	// Reset during render so the previous project's list never commits while the
	// new project loads (the load-triggering effect runs only after commit).
	if (cwd !== loadedCwd) {
		setLoadedCwd(cwd);
		setItems([]);
		setLoading(true);
		setExists(true);
	}

	const reload = useCallback(async () => {
		setItems(await fetchItems(undefined, cwd));
		setLoading(false);
	}, [cwd]);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;
		setLoading(true);
		setExists(true);
		(async () => {
			try {
				if (await backlogExists(cwd, signal)) {
					const next = await fetchItems(undefined, cwd, signal);
					if (signal.aborted) return;
					setItems(next);
					setLoading(false);
					return;
				}
				if (signal.aborted) return;
				setExists(false);
				setItems([]);
				setLoading(false);
			} catch (err) {
				if (!signal.aborted) throw err;
			}
		})();
		return () => controller.abort();
	}, [cwd]);

	const initialize = useCallback(async () => {
		await initBacklog(cwd);
		setExists(true);
		setLoading(true);
		await reload();
	}, [cwd, reload]);

	return { items, loading, exists, reload, initialize };
}
