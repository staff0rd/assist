import { describe, expect, it } from "vitest";
import { buildHighLevelStructure } from "./buildHighLevelStructure";
import { sliceHighLevelStructures } from "./sliceHighLevelStructures";
import { sliceHighLevelTests } from "./sliceHighLevelTests";
import type { HighLevelFile, HighLevelSlice, HighLevelTestFile } from "./types";

function file(path: string, additions: number, patch?: string): HighLevelFile {
	return {
		path,
		status: "modified",
		additions,
		deletions: 0,
		diffUrl: `https://example.test/${path}`,
		...(patch === undefined ? {} : { patch }),
	};
}

function slice(hunks: string[]): HighLevelSlice {
	return { title: "t", summary: "", hunks, additions: 0, deletions: 0 };
}

const split =
	"@@ -1 +1,2 @@\n ctx\n+one\n@@ -30,2 +31,3 @@ fn()\n ctx\n+two\n-old";

describe("sliceHighLevelStructures", () => {
	it("keeps only files with a hunk in the slice, recounting totals", () => {
		const structure = buildHighLevelStructure([
			file("src/a.ts", 2),
			file("src/b.ts", 3),
			file("docs/c#1.md", 5),
		]);

		const [sliced] = sliceHighLevelStructures(structure, [
			slice(["src/b.ts#0", "docs/c#1.md#2"]),
		]);

		expect(sliced).toEqual(
			buildHighLevelStructure([file("docs/c#1.md", 5), file("src/b.ts", 3)]),
		);
	});

	it("scopes a split file to the slice's hunks and names the slice holding the rest", () => {
		const structure = buildHighLevelStructure([file("a.ts", 2, split)]);

		const [first, second] = sliceHighLevelStructures(structure, [
			slice(["a.ts#0"]),
			slice(["a.ts#1"]),
		]);

		expect(first?.tree[0]).toMatchObject({
			patch: "@@ -1 +1,2 @@\n ctx\n+one",
			additions: 1,
			deletions: 0,
			split: {
				hunks: 1,
				of: 2,
				elsewhere: [{ oldStart: 30, header: "@@ -30,2 +31,3 @@", slice: 2 }],
			},
		});
		expect(second?.tree[0]).toMatchObject({
			additions: 1,
			deletions: 1,
			split: { elsewhere: [{ oldStart: 1, slice: 1 }] },
		});
	});

	it("leaves a file whole when the slice holds all its hunks, and drops hidden paths", () => {
		const structure = buildHighLevelStructure([
			file("a.ts", 2, split),
			file("a.test.ts", 1, "@@ -1 +1 @@\n+t"),
		]);

		const [only] = sliceHighLevelStructures(
			structure,
			[slice(["a.ts#0", "a.ts#1", "a.test.ts#0"])],
			new Set(["a.test.ts"]),
		);

		expect(only).toEqual(buildHighLevelStructure([file("a.ts", 2, split)]));
	});
});

describe("sliceHighLevelTests", () => {
	it("puts each test file in the slice claiming most of its hunks", () => {
		const test = (path: string): HighLevelTestFile => ({
			path,
			status: "modified",
			additions: 1,
			deletions: 0,
			diffUrl: "",
			tests: [],
		});

		const grouped = sliceHighLevelTests(
			[test("a.test.ts"), test("b.test.ts")],
			[
				slice(["a.ts#0", "b.test.ts#0"]),
				slice(["a.test.ts#0", "a.test.ts#1", "b.test.ts#1"]),
			],
		);

		expect(grouped.map((files) => files.map((f) => f.path))).toEqual([
			["b.test.ts"],
			["a.test.ts"],
		]);
	});
});
