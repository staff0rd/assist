import { describe, expect, it } from "vitest";
import { usageItemStatFigures } from "./usageItemStatFigures";

const summary = {
	itemCount: 4,
	doneCount: 3,
	repoCount: 1,
	medianPhases: 3.5,
	medianActiveMs: 2_700_000,
	medianTokens: 3_000_000,
};

describe("usageItemStatFigures", () => {
	it("keeps an interpolated phase median to one decimal", () => {
		expect(usageItemStatFigures(summary).phases).toBe("3.5");
	});

	it("spreads the medians over the median phase count", () => {
		const figures = usageItemStatFigures(summary);

		expect(figures.activeFoot).toBe("12m 51s per phase");
		expect(figures.tokensFoot).toBe("857.1k per phase");
	});

	it("says repo in the singular for a single repo", () => {
		expect(usageItemStatFigures(summary).itemsFoot).toBe(
			"across 1 repo · 3 done",
		);
	});

	it("counts no phases as one so the per-phase figures stay finite", () => {
		const figures = usageItemStatFigures({
			...summary,
			medianPhases: 0,
			medianActiveMs: 0,
			medianTokens: 0,
		});

		expect(figures.phases).toBe("0");
		expect(figures.activeFoot).toBe("0s per phase");
		expect(figures.tokensFoot).toBe("0 per phase");
	});
});
