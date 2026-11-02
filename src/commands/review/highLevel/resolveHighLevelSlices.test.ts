import { describe, expect, it } from "vitest";
import { listHighLevelHunks } from "./listHighLevelHunks";
import { resolveHighLevelSlices } from "./resolveHighLevelSlices";
import type { HighLevelFile } from "./types";

function file(path: string, patch?: string): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 3,
		deletions: 1,
		diffUrl: `https://example.test/${path}`,
		...(patch === undefined ? {} : { patch }),
	};
}

const files = [
	file("src/a.ts", "@@ -1 +1 @@\n-old\n+new\n@@ -9 +9,2 @@\n ctx\n+add"),
	file("src/a.test.ts", "@@ -0,0 +1 @@\n+it()"),
	file("logo.png"),
];
const hunks = listHighLevelHunks(files);

describe("listHighLevelHunks", () => {
	it("labels each capped hunk path#index and gives patchless files one placeholder hunk", () => {
		expect(hunks.map((hunk) => hunk.ref)).toEqual([
			"src/a.ts#0",
			"src/a.ts#1",
			"src/a.test.ts#0",
			"logo.png#0",
		]);
		expect(hunks[1]).toMatchObject({ additions: 1, deletions: 0 });
		expect(hunks[3]?.text).toContain("no patch shown");
	});
});

describe("resolveHighLevelSlices", () => {
	it("keeps known refs, totals their lines and puts unclaimed hunks in Everything else", () => {
		const { slices, warnings } = resolveHighLevelSlices(
			[
				{
					title: "Swap old for new",
					summary: "Replaces it.",
					hunks: ["src/a.ts#0", "src/a.test.ts#0", "src/a.ts#0"],
				},
			],
			hunks,
		);

		expect(warnings).toEqual([]);
		expect(slices).toEqual([
			{
				title: "Swap old for new",
				summary: "Replaces it.",
				hunks: ["src/a.ts#0", "src/a.test.ts#0"],
				additions: 2,
				deletions: 1,
			},
			{
				title: "Everything else",
				summary: "Hunks no slice claimed.",
				hunks: ["src/a.ts#1", "logo.png#0"],
				additions: 4,
				deletions: 1,
			},
		]);
	});

	it("drops unknown refs and slices left empty, with warnings", () => {
		const { slices, warnings } = resolveHighLevelSlices(
			[
				{ title: "One", summary: "", hunks: ["src/a.ts#0", "nope.ts#0"] },
				{ title: "Ghost", summary: "", hunks: ["src/a.ts#7"] },
			],
			hunks,
		);

		expect(warnings).toEqual([
			'Dropped unknown hunk nope.ts#0 from "One".',
			'Dropped unknown hunk src/a.ts#7 from "Ghost".',
			'Dropped slice "Ghost": it has no known hunks.',
		]);
		expect(slices.map((slice) => slice.title)).toEqual([
			"One",
			"Everything else",
		]);
	});

	it("lets a hunk sit in more than one slice and omits Everything else when all are claimed", () => {
		const all = hunks.map((hunk) => hunk.ref);
		const { slices } = resolveHighLevelSlices(
			[
				{ title: "A", summary: "", hunks: all },
				{ title: "B", summary: "", hunks: ["src/a.ts#0"] },
			],
			hunks,
		);

		expect(slices.map((slice) => slice.title)).toEqual(["A", "B"]);
	});

	it("rejects input that is not an array of slices", () => {
		expect(() => resolveHighLevelSlices({ title: "x" }, hunks)).toThrow(
			/JSON array of \{title, summary, hunks\[\]\}/,
		);
	});
});
