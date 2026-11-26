import { describe, expect, it } from "vitest";
import { listHighLevelHunks } from "./listHighLevelHunks";
import { resolveHighLevelSlices } from "./resolveHighLevelSlices";
import type { HighLevelTestFile } from "./types";

const tests: HighLevelTestFile[] = [
	{
		path: "src/a.test.ts",
		status: "modified",
		additions: 4,
		deletions: 0,
		diffUrl: "https://example.test/a",
		tests: [
			{
				kind: "describe",
				name: "a",
				line: 1,
				children: [
					{
						kind: "it",
						id: "src/a.test.ts:2",
						name: "returns nothing when empty",
						line: 2,
						change: "added",
					},
					{
						kind: "it",
						id: "src/a.test.ts:5",
						name: "accepts a bare array",
						line: 5,
						change: "added",
					},
				],
			},
		],
	},
];
const hunks = listHighLevelHunks([
	{
		path: "src/a.test.ts",
		status: "modified",
		additions: 4,
		deletions: 0,
		diffUrl: "https://example.test/a",
		patch: "@@ -0,0 +1 @@\n+it()",
	},
]);
const slices = [{ title: "A", summary: "s", hunks: ["src/a.test.ts#0"] }];
const manualTesting = { setup: [], steps: [] };

describe("resolveHighLevelSlices test regrouping", () => {
	it("saves no regrouping when the input has no tests key", () => {
		const resolved = resolveHighLevelSlices(
			{ slices, manualTesting },
			hunks,
			tests,
		);
		expect(resolved).not.toHaveProperty("testRegrouping");
	});

	it("keeps known tests, warns on unknown ids and puts omitted tests under Ungrouped", () => {
		const { testRegrouping, warnings } = resolveHighLevelSlices(
			{
				slices,
				manualTesting,
				tests: {
					"src/a.test.ts": [
						{
							describe: "a",
							children: [
								{
									describe: "when empty",
									children: [
										{ id: "src/a.test.ts:2", it: "it returns nothing" },
										{ id: "src/a.test.ts:99", it: "ghost" },
									],
								},
								{ describe: "when unused", children: [] },
							],
						},
					],
					"src/gone.test.ts": [],
				},
			},
			hunks,
			tests,
		);

		expect(warnings).toEqual([
			"Dropped the regrouping of src/gone.test.ts: it has no changed tests.",
			"Dropped unknown test src/a.test.ts:99 from the regrouping of src/a.test.ts.",
		]);
		expect(testRegrouping).toEqual({
			"src/a.test.ts": [
				{
					describe: "a",
					children: [
						{
							describe: "when empty",
							children: [{ id: "src/a.test.ts:2", it: "returns nothing" }],
						},
					],
				},
				{
					describe: "Ungrouped",
					ungrouped: true,
					children: [{ id: "src/a.test.ts:5", it: "accepts a bare array" }],
				},
			],
		});
	});

	it("rejects a regrouped test with neither id nor describe", () => {
		expect(() =>
			resolveHighLevelSlices(
				{ slices, manualTesting, tests: { "src/a.test.ts": [{ it: "x" }] } },
				hunks,
				tests,
			),
		).toThrow(/slices must be/);
	});
});
