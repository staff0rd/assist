import { describe, expect, it } from "vitest";
import { buildHighLevelStructure } from "./buildHighLevelStructure";
import type { HighLevelFile } from "./types";

function file(
	path: string,
	overrides: Partial<HighLevelFile> = {},
): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://github.com/org/repo/pull/1/files#diff-${path}`,
		...overrides,
	};
}

describe("buildHighLevelStructure", () => {
	it("counts files by status and totals their line counts", () => {
		const structure = buildHighLevelStructure([
			file("a.ts", { status: "added", additions: 10, deletions: 0 }),
			file("b.ts", { status: "removed", additions: 0, deletions: 4 }),
			file("c.ts", { additions: 2, deletions: 3 }),
		]);

		expect(structure).toMatchObject({
			added: 1,
			removed: 1,
			modified: 1,
			additions: 12,
			deletions: 7,
		});
	});

	it("carries the changed-file tree", () => {
		expect(
			buildHighLevelStructure([file("src/one.ts")]).tree.map(
				(node) => node.name,
			),
		).toEqual(["src"]);
	});

	it("reports nothing for a PR with no changed files", () => {
		expect(buildHighLevelStructure([])).toEqual({
			tree: [],
			added: 0,
			removed: 0,
			modified: 0,
			additions: 0,
			deletions: 0,
		});
	});
});
