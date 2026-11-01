import { useEffect, useRef } from "react";
import { isNativePlatform } from "../isNativeApp";

const EDGE_ZONE_PX = 24;
const TRIGGER_PX = 80;

export function useEdgeSwipeBack(onBack: () => void): void {
	const onBackRef = useRef(onBack);
	onBackRef.current = onBack;

	useEffect(() => {
		if (!isNativePlatform) return;
		let startX: number | null = null;
		let travel = 0;

		const onStart = (e: TouchEvent) => {
			const x = e.touches[0].clientX;
			startX = x <= EDGE_ZONE_PX ? x : null;
			travel = 0;
		};
		const onMove = (e: TouchEvent) => {
			if (startX === null) return;
			travel = e.touches[0].clientX - startX;
		};
		const onEnd = () => {
			if (startX !== null && travel >= TRIGGER_PX) onBackRef.current();
			startX = null;
			travel = 0;
		};
		const onCancel = () => {
			startX = null;
			travel = 0;
		};

		document.addEventListener("touchstart", onStart, { passive: true });
		document.addEventListener("touchmove", onMove, { passive: true });
		document.addEventListener("touchend", onEnd, { passive: true });
		document.addEventListener("touchcancel", onCancel, { passive: true });
		return () => {
			document.removeEventListener("touchstart", onStart);
			document.removeEventListener("touchmove", onMove);
			document.removeEventListener("touchend", onEnd);
			document.removeEventListener("touchcancel", onCancel);
		};
	}, []);
}
