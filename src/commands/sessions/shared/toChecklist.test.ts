import { describe, expect, it } from "vitest";
import { toChecklist } from "./toChecklist";

describe("toChecklist", () => {
	it("keeps each item's slice so per-slice ticks reach the review", () => {
		expect(
			toChecklist([
				{ id: "structure-sensible", ticked: true, slice: 2, comment: "ok" },
				{ id: "backend-pr-linked", ticked: false },
				{ id: "tests-worth-having", ticked: true, slice: "1" },
			]),
		).toEqual([
			{ id: "structure-sensible", ticked: true, comment: "ok", slice: 2 },
			{ id: "backend-pr-linked", ticked: false },
			{ id: "tests-worth-having", ticked: true },
		]);
	});
});
