import { useEffect, useRef } from "react";

export function useRecheckWhenVisible(
	reconnecting: boolean,
	check: () => void,
): void {
	const reconnectingRef = useRef(reconnecting);
	reconnectingRef.current = reconnecting;

	useEffect(() => {
		const onVisibility = () => {
			if (document.visibilityState === "visible" && !reconnectingRef.current)
				check();
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, [check]);
}
