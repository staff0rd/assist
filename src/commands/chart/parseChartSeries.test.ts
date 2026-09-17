import { describe, expect, it } from "vitest";
import { parseChartSeries } from "./parseChartSeries";

describe("parseChartSeries", () => {
	it("should parse comma separated lines", () => {
		expect(parseChartSeries(["2026-08-20,3.6", "2026-08-27,3.57"])).toEqual([
			{ label: "2026-08-20", value: 3.6 },
			{ label: "2026-08-27", value: 3.57 },
		]);
	});

	it("should parse tab separated lines", () => {
		expect(parseChartSeries(["a\t1", "b\t2"])).toEqual([
			{ label: "a", value: 1 },
			{ label: "b", value: 2 },
		]);
	});

	it("should parse whitespace separated lines", () => {
		expect(parseChartSeries(["a   1", " b 2 "])).toEqual([
			{ label: "a", value: 1 },
			{ label: "b", value: 2 },
		]);
	});

	it("should skip blank lines", () => {
		expect(parseChartSeries(["", "a 1", "   ", "b 2"])).toEqual([
			{ label: "a", value: 1 },
			{ label: "b", value: 2 },
		]);
	});

	it("should return nothing for input that is entirely blank", () => {
		expect(parseChartSeries(["", "   ", "\t"])).toEqual([]);
	});

	it("should return a single point for a one-line series", () => {
		expect(parseChartSeries(["a 1"])).toEqual([{ label: "a", value: 1 }]);
	});

	it("should keep the given order", () => {
		expect(parseChartSeries(["b 2", "a 1"]).map((p) => p.label)).toEqual([
			"b",
			"a",
		]);
	});

	it("should treat leading columns as the label", () => {
		expect(parseChartSeries(["week 34 3.6"])).toEqual([
			{ label: "week 34", value: 3.6 },
		]);
	});

	it("should reject a non-numeric value", () => {
		expect(() => parseChartSeries(["2026-08-20 avg=3.60"])).toThrow(
			/Value "avg=3.60" is not numeric, on line: 2026-08-20 avg=3.60/,
		);
	});

	it("should reject a line with no value", () => {
		expect(() => parseChartSeries(["2026-08-20"])).toThrow(
			/Expected a label and a value, got: 2026-08-20/,
		);
	});
});
