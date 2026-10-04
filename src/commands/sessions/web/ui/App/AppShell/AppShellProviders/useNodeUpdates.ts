import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NodeSelection } from "../../../useNodeSelection";
import { fetchNodeUpdate } from "./useNodeUpdates/fetchNodeUpdate";
import type { NodeUpdateEntry, NodeUpdates } from "../NodeUpdateEntry";

const POLL_MS = 60_000;

export function useNodeUpdates(selection: NodeSelection): NodeUpdates {
	const local = selection.nodes?.local;
	const namesKey = selection.names.join("\n");
	const [entries, setEntries] = useState<NodeUpdateEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const generation = useRef(0);

	const refresh = useCallback(() => {
		const names = namesKey ? namesKey.split("\n") : [];
		if (names.length === 0) return;
		const current = ++generation.current;
		void Promise.all(
			names.map((name) => fetchNodeUpdate(name, name === local)),
		).then((next) => {
			if (current !== generation.current) return;
			setEntries(next);
			setLoading(false);
		});
	}, [namesKey, local]);

	useEffect(() => {
		refresh();
		const id = setInterval(refresh, POLL_MS);
		return () => clearInterval(id);
	}, [refresh]);

	return useMemo(
		() => ({ entries, loading, refresh }),
		[entries, loading, refresh],
	);
}
