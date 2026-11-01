const EDGE_ZONE_PX = 24;
const TRIGGER_PX = 80;

function isModalOpen(): boolean {
	return (
		document.querySelector(".MuiModal-root:not(.MuiModal-hidden)") !== null
	);
}

export function createEdgeSwipeHandlers(onBack: () => void) {
	let start: { x: number; y: number } | null = null;
	let dx = 0;

	const reset = () => {
		start = null;
		dx = 0;
	};
	return {
		touchstart: (e: TouchEvent) => {
			reset();
			if (e.touches.length !== 1 || isModalOpen()) return;
			const { clientX: x, clientY: y } = e.touches[0];
			if (x <= EDGE_ZONE_PX) start = { x, y };
		},
		touchmove: (e: TouchEvent) => {
			if (start === null) return;
			if (e.touches.length !== 1) return reset();
			const { clientX, clientY } = e.touches[0];
			const nextDx = clientX - start.x;
			if (Math.abs(clientY - start.y) > Math.abs(nextDx)) return reset();
			dx = nextDx;
		},
		touchend: () => {
			if (start !== null && dx >= TRIGGER_PX) onBack();
			reset();
		},
		touchcancel: reset,
	};
}
