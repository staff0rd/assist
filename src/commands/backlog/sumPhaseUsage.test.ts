import { describe, expect, it } from "vitest";
import { sumPhaseUsage } from "./sumPhaseUsage";

describe("sumPhaseUsage", () => {
	it("returns zeroes for no phases", () => {
		expect(sumPhaseUsage([])).toEqual({
			tokensUp: 0,
			tokensDown: 0,
			activeMs: 0,
		});
	});

	it("adds every phase's tokens and active time", () => {
		expect(
			sumPhaseUsage([
				{ phaseIdx: 0, tokensUp: 100, tokensDown: 200, activeMs: 5000 },
				{ phaseIdx: 1, tokensUp: 50, tokensDown: 25, activeMs: 1000 },
			]),
		).toEqual({ tokensUp: 150, tokensDown: 225, activeMs: 6000 });
	});
});
