import { useCallback, useState } from "react";
import type { NodesState } from "../../../../types";
import { linksChangedNotice } from "./linksChangedNotice";
import { type DaemonReload, postNodesApi } from "./postNodesApi";

type Removed = { from: NodesState | null; names: ReadonlySet<string> };

// why: hides a removed row until the daemon's next nodes message, which may never come while it is stopped
export function useNodeRemoval(nodes: NodesState | null) {
	const [removed, setRemoved] = useState<Removed>({
		from: null,
		names: new Set(),
	});
	const [back, setBack] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const remove = useCallback(
		async (name: string) => {
			try {
				const { daemon } = await postNodesApi<{ daemon: DaemonReload }>(
					"unlink",
					{ name },
				);
				setRemoved((prev) => ({
					from: nodes,
					names: new Set(prev.from === nodes ? prev.names : []).add(name),
				}));
				setBack(linksChangedNotice(`Removed ${name}`, daemon));
			} catch (error) {
				setError(
					`Could not remove ${name}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		},
		[nodes],
	);
	return {
		removed: removed.from === nodes ? removed.names : new Set<string>(),
		remove,
		notices: {
			back,
			clearBack: useCallback(() => setBack(null), []),
			error,
			clearError: useCallback(() => setError(null), []),
		},
	};
}
