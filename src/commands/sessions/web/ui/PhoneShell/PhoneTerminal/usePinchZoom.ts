import { type RefObject, useEffect, useRef, useState } from "react";

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

function distance(touches: TouchList): number {
	const [a, b] = [touches[0], touches[1]];
	return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export function usePinchZoom(ref: RefObject<HTMLElement | null>): number {
	const [zoom, setZoom] = useState(DEFAULT_ZOOM);
	const zoomRef = useRef(DEFAULT_ZOOM);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let start: { distance: number; zoom: number } | null = null;

		const onStart = (e: TouchEvent) => {
			if (e.touches.length === 2)
				start = { distance: distance(e.touches), zoom: zoomRef.current };
		};
		const onMove = (e: TouchEvent) => {
			if (!start || e.touches.length !== 2) return;
			e.preventDefault();
			const next = (start.zoom * distance(e.touches)) / start.distance;
			zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
			setZoom(zoomRef.current);
		};
		const onEnd = (e: TouchEvent) => {
			if (e.touches.length < 2) start = null;
		};

		el.addEventListener("touchstart", onStart, { passive: true });
		el.addEventListener("touchmove", onMove, { passive: false });
		el.addEventListener("touchend", onEnd, { passive: true });
		el.addEventListener("touchcancel", onEnd, { passive: true });
		return () => {
			el.removeEventListener("touchstart", onStart);
			el.removeEventListener("touchmove", onMove);
			el.removeEventListener("touchend", onEnd);
			el.removeEventListener("touchcancel", onEnd);
		};
	}, [ref]);

	return zoom;
}
