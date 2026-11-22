import { describe, expect, it } from "vitest";
import { foldLastManualChecks } from "./foldLastManualChecks";

describe("foldLastManualChecks", () => {
	it("moves the last phase's checks to Review", () => {
		const result = foldLastManualChecks([
			{ name: "A", manualChecks: ["a1"] },
			{ name: "B", manualChecks: ["b1", "b2"] },
		]);

		expect(result.phases).toEqual([
			{ name: "A", manualChecks: ["a1"] },
			{ name: "B", manualChecks: undefined },
		]);
		expect(result.reviewChecks).toEqual(["b1", "b2"]);
	});

	it("appends folded checks after existing Review checks", () => {
		const result = foldLastManualChecks(
			[{ name: "A", manualChecks: ["a1", "a2"] }],
			["bumped"],
		);

		expect(result.reviewChecks).toEqual(["bumped", "a1", "a2"]);
	});

	it("leaves phases and Review checks unchanged when the last phase has none", () => {
		const phases = [{ name: "A", manualChecks: ["a1"] }, { name: "B" }];

		const result = foldLastManualChecks(phases, ["bumped"]);

		expect(result.phases).toBe(phases);
		expect(result.reviewChecks).toEqual(["bumped"]);
	});

	it("returns no Review checks for an empty plan", () => {
		expect(foldLastManualChecks([])).toEqual({ phases: [], reviewChecks: [] });
	});
});
