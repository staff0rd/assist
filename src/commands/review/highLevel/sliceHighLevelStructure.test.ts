import { describe, expect, it } from "vitest";
import { buildHighLevelStructure } from "./buildHighLevelStructure";
import { sliceHighLevelStructure } from "./sliceHighLevelStructure";
import type { HighLevelFile } from "./types";

function file(path: string, additions: number): HighLevelFile {
	return {
		path,
		status: "modified",
		additions,
		deletions: 0,
		diffUrl: `https://example.test/${path}`,
	};
}

describe("sliceHighLevelStructure", () => {
	it("keeps only files with a hunk in the slice, recounting totals", () => {
		const structure = buildHighLevelStructure([
			file("src/a.ts", 2),
			file("src/b.ts", 3),
			file("docs/c#1.md", 5),
		]);

		const sliced = sliceHighLevelStructure(structure, {
			title: "t",
			summary: "",
			hunks: ["src/b.ts#0", "docs/c#1.md#2"],
			additions: 0,
			deletions: 0,
		});

		expect(sliced).toEqual(
			buildHighLevelStructure([file("docs/c#1.md", 5), file("src/b.ts", 3)]),
		);
	});
});
