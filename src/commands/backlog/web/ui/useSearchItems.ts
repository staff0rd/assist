import { useEffect, useRef, useState } from "react";
import { fetchItems } from "./fetchItems";
import type { BacklogItem } from "./types";
import { useRepoCwd } from "./useRepoCwd";
import { useShowCompleted } from "./useShowCompleted";

export function useSearchItems() {
	const cwd = useRepoCwd();
	const [showCompleted] = useShowCompleted();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<BacklogItem[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [loadedCwd, setLoadedCwd] = useState(cwd);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	// Drop the previous project's results during render so they don't linger
	// while the new project's search is debounced/fetched.
	if (cwd !== loadedCwd) {
		setLoadedCwd(cwd);
		setResults(null);
		setLoading(query.trim().length > 0);
	}

	useEffect(() => {
		if (debounceRef.current !== undefined) clearTimeout(debounceRef.current);

		if (!query.trim()) {
			setResults(null);
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;
		setLoading(true);
		debounceRef.current = setTimeout(async () => {
			try {
				const next = await fetchItems({ query, cwd, signal, showCompleted });
				if (signal.aborted) return;
				setResults(next);
				setLoading(false);
			} catch (err) {
				if (!signal.aborted) throw err;
			}
		}, 250);

		return () => {
			if (debounceRef.current !== undefined) clearTimeout(debounceRef.current);
			controller.abort();
		};
	}, [query, cwd, showCompleted]);

	return { query, setQuery, results, loading };
}
