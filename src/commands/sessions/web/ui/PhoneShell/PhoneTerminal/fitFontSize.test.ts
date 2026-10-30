import { describe, expect, it } from "vitest";
import { fitFontSize, MIN_TERMINAL_FONT_SIZE } from "./fitFontSize";

describe("fitFontSize", () => {
	it("sizes the font so every column fits the width", () => {
		const size = fitFontSize(390, 40, 0.6, 1);

		expect(size * 0.6 * 40).toBeLessThanOrEqual(390);
		expect(size).toBeGreaterThan(MIN_TERMINAL_FONT_SIZE);
	});

	it("stays readable for wide sessions, which pan sideways", () => {
		expect(fitFontSize(390, 287, 0.6, 1)).toBe(MIN_TERMINAL_FONT_SIZE);
	});

	it("pinching out shrinks below the readable minimum", () => {
		expect(fitFontSize(390, 287, 0.6, 0.5)).toBeLessThan(
			MIN_TERMINAL_FONT_SIZE,
		);
	});

	it("pinching in enlarges the font", () => {
		expect(fitFontSize(390, 120, 0.6, 2)).toBeGreaterThan(
			fitFontSize(390, 120, 0.6, 1),
		);
	});
});
