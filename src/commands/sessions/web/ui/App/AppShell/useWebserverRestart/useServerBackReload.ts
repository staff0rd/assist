import { useCallback, useEffect, useRef } from "react";
import { waitForServerToAnswer } from "./useServerBackReload/waitForServerToAnswer";

function idleWatch() {
	return { sawDisconnect: false, waiting: false, abandoned: true };
}

export function useServerBackReload(
	active: boolean,
	reconnecting: boolean,
	onServerBack: () => void,
) {
	const watch = useRef(idleWatch());
	const serverBackRef = useRef(onServerBack);
	serverBackRef.current = onServerBack;

	useEffect(() => {
		const current = watch.current;
		if (!active || current.abandoned) return;
		if (reconnecting) {
			current.sawDisconnect = true;
			return;
		}
		if (!current.sawDisconnect || current.waiting) return;
		current.waiting = true;
		void waitForServerToAnswer(() => current.abandoned).then((answered) => {
			if (answered) serverBackRef.current();
		});
	}, [active, reconnecting]);

	const abandon = useCallback(() => {
		watch.current.abandoned = true;
	}, []);

	const arm = useCallback(() => {
		watch.current.abandoned = true;
		watch.current = { sawDisconnect: false, waiting: false, abandoned: false };
	}, []);

	useEffect(() => abandon, [abandon]);

	return { arm, abandon };
}
