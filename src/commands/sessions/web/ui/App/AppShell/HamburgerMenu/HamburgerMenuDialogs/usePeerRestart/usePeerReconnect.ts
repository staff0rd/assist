import { useEffect, useRef, useState } from "react";
import { useNodeSelectionContext } from "../../../../../useNodeSelectionContext";

export function usePeerReconnect(onBack: (message: string) => void) {
	const { nodes } = useNodeSelectionContext();
	const [watching, setWatching] = useState<string | null>(null);
	const sawDown = useRef(false);
	const link = watching
		? nodes?.links.find((l) => l.name === watching)
		: undefined;

	useEffect(() => {
		if (!watching || !link) return;
		if (link.state !== "connected") {
			sawDown.current = true;
			return;
		}
		if (!sawDown.current) return;
		setWatching(null);
		onBack(
			link.peerVersion
				? `${watching} is back (v${link.peerVersion})`
				: `${watching} is back`,
		);
	}, [watching, link, onBack]);

	return {
		watch: (peer: string) => {
			sawDown.current = false;
			setWatching(peer);
		},
		stop: () => setWatching(null),
	};
}
