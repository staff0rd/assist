import { describe, expect, it } from "vitest";
import { formatSlicingRequest } from "./formatSlicingRequest";
import type { HighLevelTestFile } from "./types";

const tests: HighLevelTestFile[] = [
	{
		path: "a.test.ts",
		status: "added",
		additions: 3,
		deletions: 0,
		diffUrl: "https://example.test/a",
		tests: [
			{
				kind: "describe",
				name: "parse",
				line: 1,
				children: [
					{ kind: "it", id: "a.test.ts:2", name: "rejects junk", line: 2 },
				],
			},
		],
	},
];

describe("formatSlicingRequest", () => {
	it("lists each changed test by id, describe path and name with the regrouping rules", () => {
		const text = formatSlicingRequest([], tests);

		expect(text).toContain("- a.test.ts:2 › parse › rejects junk");
		expect(text).toContain("Test regrouping rules:");
		expect(text).toContain('"tests": {');
	});

	it("leaves the regrouping out when no test changed", () => {
		const text = formatSlicingRequest([], []);

		expect(text).not.toContain("Test regrouping rules:");
		expect(text).not.toContain('"tests"');
	});
});
