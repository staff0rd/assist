import { useCallback, useEffect, useRef, useState } from "react";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import { useApiNode } from "../../useApiNode";
import { fetchEntries } from "./useConfigEntries/fetchEntries";

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

export function useConfigEntries(cwd: string): UseConfigEntries {
	const [state, setState] = useState<ConfigEntriesState>(LOADING);
	const [reloadCount, setReloadCount] = useState(0);
	const loadedRepo = useRef<string | null>(null);
	const reload = useCallback(() => setReloadCount((count) => count + 1), []);
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			loadedRepo.current = null;
			setState({ entries: [], loading: false, error: "No repo selected." });
			return;
		}
		let cancelled = false;
		const repo = `${node ?? ""}\0${cwd}`;
		const isRefetchOfSameRepo = loadedRepo.current === repo;
		if (!isRefetchOfSameRepo) setState(LOADING);
		fetchEntries(cwd, node)
			.then((entries) => {
				if (cancelled) return;
				loadedRepo.current = repo;
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
	}, [cwd, node, reloadCount]);

	return { ...state, reload };
}
