import { describe, expect, it } from "vitest";
import { estimateReadSeconds } from "./estimateReadSeconds";

const effectiveWpm = (words: number) =>
	(words / estimateReadSeconds(words, 200)) * 60;

describe("estimateReadSeconds", () => {
	it("should return zero for an empty body", () => {
		expect(estimateReadSeconds(0, 200)).toBe(0);
	});

	it("should take more than twice as long for twice the words", () => {
		expect(estimateReadSeconds(200, 200)).toBeGreaterThan(
			2 * estimateReadSeconds(100, 200),
		);
	});

	it("should read a long description at a slower rate than a short one", () => {
		expect(effectiveWpm(500)).toBeLessThan(effectiveWpm(100));
	});

	it("should halve the estimate when the configured rate doubles", () => {
		expect(estimateReadSeconds(150, 400)).toBe(
			Math.round(estimateReadSeconds(150, 200) / 2),
		);
	});

	it("should match a timed reading of a 129 word description", () => {
		expect(estimateReadSeconds(129, 200)).toBe(88);
	});

	it("should match a timed reading of a 485 word description", () => {
		expect(estimateReadSeconds(485, 200)).toBe(416);
	});
});
