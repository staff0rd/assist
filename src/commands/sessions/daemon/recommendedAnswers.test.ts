import { describe, expect, it } from "vitest";
import { recommendedAnswers } from "./recommendedAnswers";

function body(
	options: { label: string; description: string }[],
	multiSelect = false,
) {
	return JSON.stringify({
		questions: [{ question: "Name?", header: "Name", multiSelect, options }],
	});
}

describe("recommendedAnswers", () => {
	it("picks an option whose label ends in (Recommended)", () => {
		expect(
			recommendedAnswers(
				body([
					{ label: "A", description: "" },
					{ label: "B (Recommended)", description: "" },
				]),
			),
		).toEqual({ "Name?": "B (Recommended)" });
	});

	it("matches the marker case-insensitively in the description and returns the label", () => {
		expect(
			recommendedAnswers(
				body([
					{
						label: "TUSK-4",
						description: "Continues the TUSK family (recommended)",
					},
					{ label: "HAWK-1", description: "Starts a new family" },
				]),
			),
		).toEqual({ "Name?": "TUSK-4" });
	});

	it("prefers a label marker over a description that mentions one", () => {
		expect(
			recommendedAnswers(
				body([
					{ label: "A", description: "Cheaper than B (recommended)" },
					{ label: "B (RECOMMENDED)", description: "" },
				]),
			),
		).toEqual({ "Name?": "B (RECOMMENDED)" });
	});

	it("leaves the form for a human when no option is marked", () => {
		expect(
			recommendedAnswers(
				body([
					{ label: "A", description: "recommended by nobody" },
					{ label: "B", description: "" },
				]),
			),
		).toBeUndefined();
	});

	it("leaves multi-select questions for a human", () => {
		expect(
			recommendedAnswers(
				body(
					[
						{ label: "A (Recommended)", description: "" },
						{ label: "B", description: "" },
					],
					true,
				),
			),
		).toBeUndefined();
	});
});
