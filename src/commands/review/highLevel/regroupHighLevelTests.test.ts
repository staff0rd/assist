import { describe, expect, it } from "vitest";
import { regroupHighLevelTests } from "./regroupHighLevelTests";
import type { HighLevelTestFile } from "./types";

const file: HighLevelTestFile = {
	path: "a.test.ts",
	status: "added",
	additions: 3,
	deletions: 0,
	diffUrl: "https://example.test/a",
	tests: [
		{ kind: "it", id: "a.test.ts:1", name: "works when empty", line: 1 },
		{ kind: "it", id: "a.test.ts:2", name: "other", line: 2 },
	],
};

describe("regroupHighLevelTests", () => {
	it("renames grouped tests, keeps their written name and gathers the rest under Ungrouped", () => {
		const [regrouped] = regroupHighLevelTests([file], {
			"a.test.ts": [
				{
					describe: "when empty",
					children: [{ id: "a.test.ts:1", it: "works" }],
				},
			],
		});

		expect(regrouped?.tests).toEqual([
			{
				kind: "describe",
				name: "when empty",
				line: 0,
				children: [
					{
						kind: "it",
						id: "a.test.ts:1",
						name: "works",
						writtenName: "works when empty",
						line: 1,
					},
				],
			},
			{
				kind: "describe",
				name: "Ungrouped",
				line: 1,
				ungrouped: true,
				children: [{ kind: "it", id: "a.test.ts:2", name: "other", line: 2 }],
			},
		]);
	});
});
