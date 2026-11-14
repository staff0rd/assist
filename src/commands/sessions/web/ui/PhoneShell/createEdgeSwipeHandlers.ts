import { edgeSwipeGesture } from "./PhoneNavStack/edgeSwipeGesture";

type SwipeZone = { edgeZone: number; activation: number };

export type SwipeCallbacks = {
	canStart: () => boolean;
	onStart: () => void;
	onMove: (dx: number) => void;
	onEnd: (dx: number, velocity: number) => void;
};

export function createEdgeSwipeHandlers(
	{ edgeZone, activation }: SwipeZone,
	callbacks: SwipeCallbacks,
) {
	const gesture = edgeSwipeGesture(activation, callbacks);
	return {
		touchstart: (e: TouchEvent) => {
			gesture.cancel();
			if (e.touches.length !== 1) return;
			const { clientX: x, clientY: y } = e.touches[0];
			if (x <= edgeZone && callbacks.canStart())
				gesture.begin(x, y, e.timeStamp);
		},
		touchmove: (e: TouchEvent) => {
			if (e.touches.length !== 1) return gesture.cancel();
			const { clientX, clientY } = e.touches[0];
			if (gesture.move(clientX, clientY, e.timeStamp) && e.cancelable)
				e.preventDefault();
		},
		touchend: (e: TouchEvent) => gesture.end(e.timeStamp),
		touchcancel: () => gesture.cancel(),
	};
}
