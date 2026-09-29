import { type WheelEvent, useRef } from "react";

const gestureEndsAfterIdleMs = 150;
const stepThresholdPx = 40;
const lineHeightPx = 16;

export function useWheelGesture(
	stepOncePerGesture: (direction: 1 | -1) => void,
) {
	const gesture = useRef({ lastAt: 0, accumulated: 0, stepped: false });

	return (e: WheelEvent) => {
		const now = Date.now();
		const g = gesture.current;
		if (now - g.lastAt > gestureEndsAfterIdleMs) {
			g.accumulated = 0;
			g.stepped = false;
		}
		g.lastAt = now;
		if (g.stepped) return;
		g.accumulated += e.deltaMode === 1 ? e.deltaY * lineHeightPx : e.deltaY;
		if (Math.abs(g.accumulated) < stepThresholdPx) return;
		g.stepped = true;
		stepOncePerGesture(g.accumulated < 0 ? 1 : -1);
	};
}
