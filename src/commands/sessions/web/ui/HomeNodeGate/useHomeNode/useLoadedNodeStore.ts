import { useEffect, useState } from "react";
import { reportCaughtError } from "../../clientFailures/reportCaughtError";
import { loadNodeStore, type NodeStore } from "../nodeStore";

export function useLoadedNodeStore() {
	const [store, setStore] = useState<NodeStore>();

	useEffect(() => {
		loadNodeStore()
			.then(setStore)
			.catch((error: unknown) => {
				reportCaughtError(error, "node store");
				setStore({ nodes: [], homeUrl: undefined });
			});
	}, []);

	return [store, setStore] as const;
}
