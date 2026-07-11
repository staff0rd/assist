import { describe, expect, it } from "vitest";
import { sumPhaseUsage } from "./sumPhaseUsage";

describe("sumPhaseUsage", () => {
	it("returns zeroes for no phases", () => {
		expect(sumPhaseUsage([])).toEqual({
			tokensUp: 0,
			tokensDown: 0,
			activeMs: 0,
			peakContextPct: 0,
		});
	});

	it("adds tokens/active time and takes the max peak context", () => {
		expect(
			sumPhaseUsage([
				{
					phaseIdx: 0,
					tokensUp: 100,
					tokensDown: 200,
					activeMs: 5000,
					peakContextPct: 45,
				},
				{
					phaseIdx: 1,
					tokensUp: 50,
					tokensDown: 25,
					activeMs: 1000,
					peakContextPct: 72,
				},
			]),
		).toEqual({
			tokensUp: 150,
			tokensDown: 225,
			activeMs: 6000,
			peakContextPct: 72,
		});
	});
});
