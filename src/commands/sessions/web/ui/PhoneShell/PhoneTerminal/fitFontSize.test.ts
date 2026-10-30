import { describe, expect, it } from "vitest";
import { fitFontSize, MIN_TERMINAL_FONT_SIZE } from "./fitFontSize";

describe("fitFontSize", () => {
	it("sizes the font so every column fits the width", () => {
		const size = fitFontSize(390, 60, 0.6, 1);

		expect(size * 0.6 * 60).toBeLessThanOrEqual(390);
		expect(size).toBeGreaterThan(10);
	});

	it("never goes below the minimum for wide sessions", () => {
		expect(fitFontSize(390, 200, 0.6, 1)).toBe(MIN_TERMINAL_FONT_SIZE);
	});

	it("scales with pinch zoom", () => {
		expect(fitFontSize(390, 120, 0.6, 2)).toBeGreaterThan(
			fitFontSize(390, 120, 0.6, 1),
		);
	});
});
