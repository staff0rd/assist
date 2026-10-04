import { useCallback, useEffect, useRef, useState } from "react";
import { useNodeSelectionContext } from "../../../../../useNodeSelectionContext";

export type DescribeBack = (peer: string, version?: string) => string;

type Watching = { peer: string; describe: DescribeBack };

export function usePeerReconnect(onBack: (message: string) => void) {
	const { nodes } = useNodeSelectionContext();
	const [watching, setWatching] = useState<Watching | null>(null);
	const sawDown = useRef(false);
	const link = watching
		? nodes?.links.find((l) => l.name === watching.peer)
		: undefined;

	useEffect(() => {
		if (!watching || !link) return;
		if (link.state !== "connected") {
			sawDown.current = true;
			return;
		}
		if (!sawDown.current) return;
		setWatching(null);
		onBack(watching.describe(watching.peer, link.peerVersion));
	}, [watching, link, onBack]);

	const watch = useCallback((peer: string, describe: DescribeBack) => {
		sawDown.current = false;
		setWatching({ peer, describe });
	}, []);
	const stop = useCallback(() => setWatching(null), []);

	return { watch, stop };
}
