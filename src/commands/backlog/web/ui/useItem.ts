import { useCallback, useEffect, useState } from "react";
import { fetchItem } from "./fetchItem";
import type { BacklogItem } from "./types";
import { useRepoCwd } from "./useRepoCwd";

/**
 * Load a single item's full record on demand for the detail and edit views,
 * which can no longer read it from the lightweight list payload. `loading` stays
 * true until the first fetch resolves so the form initialises from real data.
 */
export function useItem(id: number) {
	const cwd = useRepoCwd();
	const [item, setItem] = useState<BacklogItem | null>(null);
	const [loading, setLoading] = useState(true);

	const reload = useCallback(async () => {
		setItem(await fetchItem(id, cwd));
	}, [id, cwd]);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;
		setLoading(true);
		(async () => {
			try {
				const next = await fetchItem(id, cwd, signal);
				if (signal.aborted) return;
				setItem(next);
				setLoading(false);
			} catch (err) {
				if (!signal.aborted) throw err;
			}
		})();
		return () => controller.abort();
	}, [id, cwd]);

	return { item, loading, reload };
}
