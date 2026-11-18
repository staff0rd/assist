import { describe, expect, it } from "vitest";
import { textSizeOffset } from "./textSizeOffset";

describe("textSizeOffset", () => {
	it("keeps values inside the range", () => {
		expect(textSizeOffset(3)).toBe(3);
		expect(textSizeOffset(-4)).toBe(-4);
		expect(textSizeOffset(8)).toBe(8);
	});

	it("clamps values outside the range", () => {
		expect(textSizeOffset(-5)).toBe(-4);
		expect(textSizeOffset(9)).toBe(8);
	});

	it("defaults non-numbers to 0", () => {
		expect(textSizeOffset(undefined)).toBe(0);
		expect(textSizeOffset("2")).toBe(0);
		expect(textSizeOffset(Number.NaN)).toBe(0);
	});
});
