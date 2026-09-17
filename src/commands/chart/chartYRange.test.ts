import { describe, expect, it } from "vitest";
import { chartYRange } from "./chartYRange";

describe("chartYRange", () => {
	it("should fit a narrow band well above zero", () => {
		expect(chartYRange([3.6, 3.57, 3.45, 3.5])).toEqual({
			minY: 3.42,
			maxY: 3.63,
		});
	});

	it("should pad a flat series so the line is not on the axis", () => {
		expect(chartYRange([5, 5, 5])).toEqual({ minY: 4, maxY: 6 });
	});

	it("should pad a flat series of zeroes", () => {
		expect(chartYRange([0, 0])).toEqual({ minY: -1, maxY: 1 });
	});

	it("should handle negative values", () => {
		expect(chartYRange([-4, -1])).toEqual({ minY: -4.6, maxY: -0.4 });
	});
});
