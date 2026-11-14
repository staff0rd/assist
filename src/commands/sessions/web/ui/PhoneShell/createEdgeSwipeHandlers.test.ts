import { describe, expect, it, vi } from "vitest";
import { createEdgeSwipeHandlers } from "./createEdgeSwipeHandlers";

function touch(x: number, y = 300, timeStamp = 0, count = 1) {
	return {
		touches: Array.from({ length: count }, () => ({ clientX: x, clientY: y })),
		timeStamp,
		cancelable: true,
		preventDefault: vi.fn(),
	} as unknown as TouchEvent;
}

function setup(canStart = true) {
	const callbacks = {
		canStart: vi.fn(() => canStart),
		onStart: vi.fn(),
		onMove: vi.fn(),
		onEnd: vi.fn(),
	};
	const h = createEdgeSwipeHandlers({ edgeZone: 24, activation: 6 }, callbacks);
	return { h, callbacks };
}

describe("createEdgeSwipeHandlers", () => {
	it("tracks the finger once past the activation distance", () => {
		const { h, callbacks } = setup();
		h.touchstart(touch(5, 300, 0));
		h.touchmove(touch(9, 300, 10));
		expect(callbacks.onStart).not.toHaveBeenCalled();
		const move = touch(85, 300, 20);
		h.touchmove(move);
		expect(callbacks.onStart).toHaveBeenCalledOnce();
		expect(callbacks.onMove).toHaveBeenLastCalledWith(80);
		expect(move.preventDefault).toHaveBeenCalled();
		h.touchend(touch(85, 300, 30));
		expect(callbacks.onEnd).toHaveBeenCalledWith(80, expect.any(Number));
	});

	it("leaves a tap inside the edge zone alone", () => {
		const { h, callbacks } = setup();
		h.touchstart(touch(10));
		h.touchmove(touch(12));
		h.touchend(touch(12));
		expect(callbacks.onStart).not.toHaveBeenCalled();
		expect(callbacks.onEnd).not.toHaveBeenCalled();
	});

	it("ignores a touch away from the edge", () => {
		const { h, callbacks } = setup();
		h.touchstart(touch(100));
		h.touchmove(touch(200));
		expect(callbacks.onStart).not.toHaveBeenCalled();
	});

	it("ignores a mostly-vertical drag", () => {
		const { h, callbacks } = setup();
		h.touchstart(touch(5, 300));
		h.touchmove(touch(15, 340));
		h.touchmove(touch(150, 340));
		expect(callbacks.onStart).not.toHaveBeenCalled();
	});

	it("does not start when the stack refuses", () => {
		const { h, callbacks } = setup(false);
		h.touchstart(touch(5));
		h.touchmove(touch(100));
		expect(callbacks.onStart).not.toHaveBeenCalled();
	});

	it("cancels when a second finger lands", () => {
		const { h, callbacks } = setup();
		h.touchstart(touch(5));
		h.touchmove(touch(100));
		h.touchstart(touch(100, 300, 0, 2));
		expect(callbacks.onEnd).toHaveBeenCalledWith(0, -Infinity);
	});

	it("reports a rightward flick velocity", () => {
		const { h, callbacks } = setup();
		h.touchstart(touch(5, 300, 0));
		h.touchmove(touch(25, 300, 10));
		h.touchmove(touch(65, 300, 20));
		h.touchend(touch(65, 300, 25));
		expect(callbacks.onEnd.mock.calls[0][1]).toBeGreaterThan(1);
	});
});
