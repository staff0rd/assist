import type { SwipeCallbacks } from "../createEdgeSwipeHandlers";
import { swipeActivation } from "./swipeActivation";
import { swipeVelocity } from "./swipeVelocity";

export function edgeSwipeGesture(
	activation: number,
	callbacks: SwipeCallbacks,
) {
	let start: { x: number; y: number } | null = null;
	let active = false;
	let dx = 0;
	const velocity = swipeVelocity();
	const cancel = () => {
		if (active) callbacks.onEnd(0, -Infinity);
		start = null;
		active = false;
	};
	return {
		cancel,
		begin(x: number, y: number, t: number) {
			cancel();
			start = { x, y };
			velocity.reset(x, t);
		},
		move(x: number, y: number, t: number): boolean {
			if (start === null) return false;
			dx = x - start.x;
			if (!active) {
				const next = swipeActivation(dx, y - start.y, activation);
				if (next === "reject") cancel();
				if (next !== "start") return false;
				active = true;
				callbacks.onStart();
			}
			velocity.sample(x, t);
			callbacks.onMove(Math.max(0, dx));
			return true;
		},
		end(t: number) {
			if (active) callbacks.onEnd(Math.max(0, dx), velocity.at(t));
			active = false;
			start = null;
		},
	};
}
