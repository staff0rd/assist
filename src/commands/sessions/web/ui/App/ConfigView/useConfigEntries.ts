import { useCallback, useEffect, useRef, useState } from "react";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";

type ConfigEntriesState = {
	entries: ConfigEntry[];
	loading: boolean;
	error: string | null;
};

type UseConfigEntries = ConfigEntriesState & { reload: () => void };

const LOADING: ConfigEntriesState = {
	entries: [],
	loading: true,
	error: null,
};

async function fetchEntries(cwd: string): Promise<ConfigEntry[]> {
	const res = await fetch(`/api/config?cwd=${encodeURIComponent(cwd)}`);
	const body = await res.json();
	if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
	return body;
}

export function useConfigEntries(cwd: string): UseConfigEntries {
	const [state, setState] = useState<ConfigEntriesState>(LOADING);
	const [reloadCount, setReloadCount] = useState(0);
	const loadedCwd = useRef<string | null>(null);
	const reload = useCallback(() => setReloadCount((count) => count + 1), []);

	useEffect(() => {
		if (!cwd) {
			loadedCwd.current = null;
			setState({ entries: [], loading: false, error: "No repo selected." });
			return;
		}
		let cancelled = false;
		const isRefetchOfSameRepo = loadedCwd.current === cwd;
		if (!isRefetchOfSameRepo) setState(LOADING);
		fetchEntries(cwd)
			.then((entries) => {
				if (cancelled) return;
				loadedCwd.current = cwd;
				setState({ entries, loading: false, error: null });
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				setState({
					entries: [],
					loading: false,
					error:
						error instanceof Error ? error.message : "Failed to load config.",
				});
			});
		return () => {
			cancelled = true;
		};
	}, [cwd, reloadCount]);

	return { ...state, reload };
}
