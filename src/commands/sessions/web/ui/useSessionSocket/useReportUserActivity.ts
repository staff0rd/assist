import { useEffect } from "react";

export const USER_ACTIVITY_THROTTLE_MS = 15_000;

const EVENTS = [
	"pointermove",
	"pointerdown",
	"keydown",
	"wheel",
	"touchstart",
] as const;

export function useReportUserActivity(send: (msg: object) => void): void {
	useEffect(() => {
		let lastSent = Number.NEGATIVE_INFINITY;
		const onActivity = () => {
			if (document.visibilityState !== "visible") return;
			const now = Date.now();
			if (now - lastSent < USER_ACTIVITY_THROTTLE_MS) return;
			lastSent = now;
			send({ type: "user-activity" });
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
