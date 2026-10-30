import { describe, expect, it } from "vitest";
import { fitFontSize, MIN_TERMINAL_FONT_SIZE } from "./fitFontSize";
import { phoneGridSize } from "./phoneGridSize";

describe("phoneGridSize", () => {
	it("sizes the pty so its columns fit the phone at a readable font", () => {
		const { cols } = phoneGridSize(382, 500, 0.6);

		expect(fitFontSize(382, cols, 0.6, 1)).toBeGreaterThanOrEqual(
			MIN_TERMINAL_FONT_SIZE,
		);
		expect(cols * MIN_TERMINAL_FONT_SIZE * 0.6).toBeLessThanOrEqual(382);
	});

	it("fills the available height with rows", () => {
		expect(phoneGridSize(382, 500, 0.6).rows).toBe(33);
	});

	it("keeps a usable minimum in a tiny container", () => {
		expect(phoneGridSize(10, 10, 0.6)).toEqual({ cols: 20, rows: 5 });
	});
});
