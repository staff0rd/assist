import { describe, expect, it } from "vitest";
import { criterionNumbers } from "./criterionNumbers";

describe("criterionNumbers", () => {
	it("numbers each level and restarts it under a new parent", () => {
		expect(criterionNumbers([0, 1, 1, 2, 0, 1])).toEqual([
			"1",
			"1.1",
			"1.2",
			"1.2.1",
			"2",
			"2.1",
		]);
	});

	it("has nothing to number for an empty outline", () => {
		expect(criterionNumbers([])).toEqual([]);
	});
});
