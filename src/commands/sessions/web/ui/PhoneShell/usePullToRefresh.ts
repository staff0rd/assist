import { type RefObject, useEffect, useState } from "react";

const TRIGGER_PX = 70;
const MAX_PULL_PX = 100;
const REFRESH_HOLD_MS = 800;

export function usePullToRefresh(
	ref: RefObject<HTMLElement | null>,
	onRefresh: () => void,
): { pull: number; refreshing: boolean } {
	const [pull, setPull] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let startY: number | null = null;
		let distance = 0;

		const onStart = (e: TouchEvent) => {
			startY = el.scrollTop <= 0 ? e.touches[0].clientY : null;
		};
		const onMove = (e: TouchEvent) => {
			if (startY === null) return;
			distance = Math.min(MAX_PULL_PX, e.touches[0].clientY - startY);
			setPull(Math.max(0, distance));
		};
		const onEnd = () => {
			if (startY !== null && distance >= TRIGGER_PX) {
				setRefreshing(true);
				onRefresh();
				setTimeout(() => setRefreshing(false), REFRESH_HOLD_MS);
			}
			startY = null;
			distance = 0;
			setPull(0);
		};

		el.addEventListener("touchstart", onStart, { passive: true });
		el.addEventListener("touchmove", onMove, { passive: true });
		el.addEventListener("touchend", onEnd, { passive: true });
		return () => {
			el.removeEventListener("touchstart", onStart);
			el.removeEventListener("touchmove", onMove);
			el.removeEventListener("touchend", onEnd);
		};
	}, [ref, onRefresh]);

	return { pull, refreshing };
}
