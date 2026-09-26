import { describe, expect, it } from "vitest";
import { balancedWrapWidth } from "./balancedWrapWidth";

describe("balancedWrapWidth", () => {
	it("leaves the width unset when everything fits on one row", () => {
		expect(balancedWrapWidth([40, 40, 40], 8, 136)).toBeUndefined();
	});

	it("narrows a two-row wrap so the rows balance instead of stranding one item", () => {
		const widths = [40, 40, 40, 40, 40];
		const width = balancedWrapWidth(widths, 8, 200);
		expect(width).toBe(137);
	});

	it("never narrows below the widest item", () => {
		expect(balancedWrapWidth([30, 120, 30], 8, 150)).toBeGreaterThanOrEqual(
			120,
		);
	});

	it("leaves the width unset when there is nothing to lay out", () => {
		expect(balancedWrapWidth([], 8, 100)).toBeUndefined();
	});
});
