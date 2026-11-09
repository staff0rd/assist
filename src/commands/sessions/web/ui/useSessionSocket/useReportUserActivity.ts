import { useEffect, useRef } from "react";

export const USER_ACTIVITY_THROTTLE_MS = 15_000;

const EVENTS = [
	"pointermove",
	"pointerdown",
	"keydown",
	"wheel",
	"touchstart",
] as const;

export function useReportUserActivity(
	send: (msg: object) => void,
	viewedNodes: string[] = [],
): void {
	const nodesRef = useRef(viewedNodes);
	nodesRef.current = viewedNodes;
	useEffect(() => {
		let lastSent = Number.NEGATIVE_INFINITY;
		const onActivity = () => {
			if (document.visibilityState !== "visible") return;
			const now = Date.now();
			if (now - lastSent < USER_ACTIVITY_THROTTLE_MS) return;
			lastSent = now;
			const nodes = nodesRef.current;
			send(
				nodes.length > 0
					? { type: "user-activity", nodes }
					: { type: "user-activity" },
			);
		};
		const options = { capture: true, passive: true };
		for (const event of EVENTS)
			document.addEventListener(event, onActivity, options);
		return () => {
			for (const event of EVENTS)
				document.removeEventListener(event, onActivity, options);
		};
	}, [send]);
}
