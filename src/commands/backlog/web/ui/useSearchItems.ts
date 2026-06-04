import { useEffect, useRef, useState } from "react";
import { fetchItems } from "./api";
import type { BacklogItem } from "./types";

export function useSearchItems() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<BacklogItem[] | null>(null);
	const [loading, setLoading] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	useEffect(() => {
		if (debounceRef.current !== undefined) clearTimeout(debounceRef.current);

		if (!query.trim()) {
			setResults(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		debounceRef.current = setTimeout(async () => {
			setResults(await fetchItems(query));
			setLoading(false);
		}, 250);

		return () => {
			if (debounceRef.current !== undefined) clearTimeout(debounceRef.current);
		};
	}, [query]);

	return { query, setQuery, results, loading };
}
