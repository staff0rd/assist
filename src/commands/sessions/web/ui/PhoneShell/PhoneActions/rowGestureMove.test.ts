import { describe, expect, it } from "vitest";
import { type RowGesture, rowGestureMove, snapOffset } from "./rowGestureMove";

const start: RowGesture = { x: 100, y: 100, base: 0, swiping: false };

describe("rowGestureMove", () => {
	it("hands vertical drags to the scroller", () => {
		expect(rowGestureMove(start, 102, 130, 160)).toEqual({ kind: "scroll" });
	});

	it("waits inside the slop", () => {
		expect(rowGestureMove(start, 95, 102, 160)).toEqual({ kind: "wait" });
	});

	it("clamps a left swipe to the reveal width", () => {
		expect(rowGestureMove(start, -200, 100, 160)).toEqual({
			kind: "swipe",
			offset: -160,
			started: true,
		});
	});

	it("never slides right of closed", () => {
		const open = { ...start, swiping: true };
		expect(rowGestureMove(open, 180, 100, 160)).toMatchObject({ offset: 0 });
	});
});

describe("snapOffset", () => {
	it("snaps open past half the reveal width", () => {
		expect(snapOffset(-90, 160)).toBe(-160);
		expect(snapOffset(-70, 160)).toBe(0);
	});
});
