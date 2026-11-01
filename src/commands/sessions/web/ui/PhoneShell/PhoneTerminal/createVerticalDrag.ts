const FRICTION = 0.95;
const MIN_VELOCITY = 0.02;
const FRAME_MS = 16;
const FLICK_MS = 100;

type Drag = { x: number; y: number; t: number; axis?: "x" | "y"; v: number };

export function createVerticalDrag(scrollBy: (dy: number) => void) {
	let drag: Drag | null = null;
	let frame = 0;

	const glide = (v: number) => {
		if (Math.abs(v) < MIN_VELOCITY) return;
		scrollBy(v * FRAME_MS);
		frame = requestAnimationFrame(() => glide(v * FRICTION));
	};

	const start = (e: TouchEvent) => {
		cancelAnimationFrame(frame);
		const t = e.touches[0];
		drag =
			e.touches.length === 1
				? { x: t.clientX, y: t.clientY, t: e.timeStamp, v: 0 }
				: null;
	};
	const move = (e: TouchEvent) => {
		if (!drag || e.touches.length !== 1) return;
		const t = e.touches[0];
		const dy = drag.y - t.clientY;
		drag.axis ??= Math.abs(drag.x - t.clientX) > Math.abs(dy) ? "x" : "y";
		if (drag.axis === "x") return;
		e.preventDefault();
		const dt = Math.max(1, e.timeStamp - drag.t);
		Object.assign(drag, { y: t.clientY, t: e.timeStamp, v: dy / dt });
		scrollBy(dy);
	};
	const end = (e: TouchEvent) => {
		if (!drag || e.touches.length > 0) return;
		if (drag.axis === "y" && e.timeStamp - drag.t < FLICK_MS) glide(drag.v);
		drag = null;
	};
	const stop = () => cancelAnimationFrame(frame);

	return { start, move, end, stop };
}
