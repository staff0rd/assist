import { useCallback, useEffect, useState } from "react";
import { initBacklog } from "./api";
import { backlogExists } from "./backlogExists";
import { fetchItems } from "./fetchItems";
import type { BacklogItemSummary } from "./types";
import { useRepoCwd } from "./useRepoCwd";
import { useShowCompleted } from "./useShowCompleted";

export function useBacklogItems() {
	const cwd = useRepoCwd();
	const [showCompleted] = useShowCompleted();
	const [items, setItems] = useState<BacklogItemSummary[]>([]);
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
		setItems(await fetchItems({ cwd, showCompleted }));
		setLoading(false);
	}, [cwd, showCompleted]);

	// Refetches when showCompleted flips so completed items are only ever
	// fetched (and sent over the wire) while the toggle is on.
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;
		setLoading(true);
		setExists(true);
		(async () => {
			try {
				const found = await backlogExists(cwd, signal);
				const next = found
					? await fetchItems({ cwd, signal, showCompleted })
					: [];
				if (signal.aborted) return;
				setExists(found);
				setItems(next);
				setLoading(false);
			} catch (err) {
				if (!signal.aborted) throw err;
			}
		})();
		return () => controller.abort();
	}, [cwd, showCompleted]);

	const initialize = useCallback(async () => {
		await initBacklog(cwd);
		setExists(true);
		setLoading(true);
		await reload();
	}, [cwd, reload]);

	return { items, loading, exists, reload, initialize };
}
