import { afterEach, describe, expect, it, vi } from "vitest";
import { createVerticalDrag } from "./createVerticalDrag";

function touch(timeStamp: number, ...points: [number, number][]) {
	return {
		timeStamp,
		touches: points.map(([clientX, clientY]) => ({ clientX, clientY })),
		preventDefault: vi.fn(),
	} as unknown as TouchEvent;
}

function setup() {
	const frames: FrameRequestCallback[] = [];
	vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
		frames.push(cb);
		return frames.length;
	});
	vi.stubGlobal("cancelAnimationFrame", () => {});
	const scrollBy = vi.fn();
	return { drag: createVerticalDrag(scrollBy), scrollBy, frames };
}

afterEach(() => vi.unstubAllGlobals());

describe("createVerticalDrag", () => {
	it("scrolls by the vertical drag distance and prevents native scroll", () => {
		const { drag, scrollBy } = setup();
		drag.start(touch(0, [50, 200]));
		const move = touch(10, [50, 180]);
		drag.move(move);
		expect(scrollBy).toHaveBeenCalledWith(20);
		expect(move.preventDefault).toHaveBeenCalled();
	});

	it("leaves horizontal drags to native scrolling", () => {
		const { drag, scrollBy } = setup();
		drag.start(touch(0, [50, 200]));
		const move = touch(10, [10, 195]);
		drag.move(move);
		expect(scrollBy).not.toHaveBeenCalled();
		expect(move.preventDefault).not.toHaveBeenCalled();
	});

	it("ignores two-finger gestures", () => {
		const { drag, scrollBy } = setup();
		drag.start(touch(0, [50, 200], [100, 300]));
		drag.move(touch(10, [50, 150], [100, 350]));
		expect(scrollBy).not.toHaveBeenCalled();
	});

	it("glides after a flick", () => {
		const { drag, scrollBy, frames } = setup();
		drag.start(touch(0, [50, 200]));
		drag.move(touch(10, [50, 180]));
		drag.end(touch(20));
		expect(scrollBy).toHaveBeenCalledTimes(2);
		expect(frames).toHaveLength(1);
	});

	it("does not glide when the finger rested before lifting", () => {
		const { drag, scrollBy, frames } = setup();
		drag.start(touch(0, [50, 200]));
		drag.move(touch(10, [50, 180]));
		drag.end(touch(500));
		expect(scrollBy).toHaveBeenCalledTimes(1);
		expect(frames).toHaveLength(0);
	});
});
