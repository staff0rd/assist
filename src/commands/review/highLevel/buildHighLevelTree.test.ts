import { describe, expect, it } from "vitest";
import { buildHighLevelTree } from "./buildHighLevelTree";
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

describe("buildHighLevelTree", () => {
	it("nests files under their directories with rolled-up counts", () => {
		const [dir] = buildHighLevelTree([
			file("src/one.ts", { additions: 3, deletions: 1 }),
			file("src/two.ts", { additions: 4, deletions: 2 }),
		]);

		expect(dir).toMatchObject({
			kind: "dir",
			name: "src",
			path: "src",
			additions: 7,
			deletions: 3,
		});
		expect(
			dir?.kind === "dir" && dir.children.map((child) => child.name),
		).toEqual(["one.ts", "two.ts"]);
	});

	it("collapses a chain of single-child directories into one row", () => {
		const [dir] = buildHighLevelTree([file("src/commands/review/run.ts")]);

		expect(dir).toMatchObject({
			kind: "dir",
			name: "src/commands/review",
			path: "src/commands/review",
		});
	});

	it("sorts directories before files, each by name", () => {
		const tree = buildHighLevelTree([
			file("zeta.ts"),
			file("alpha.ts"),
			file("src/one.ts"),
			file("lib/two.ts"),
		]);

		expect(tree.map((node) => node.name)).toEqual([
			"lib",
			"src",
			"alpha.ts",
			"zeta.ts",
		]);
	});

	it("carries each file's status and GitHub diff link to its leaf", () => {
		const [leaf] = buildHighLevelTree([
			file("schema.graphql", { status: "added" }),
		]);

		expect(leaf).toMatchObject({
			kind: "file",
			name: "schema.graphql",
			path: "schema.graphql",
			status: "added",
			diffUrl: "https://github.com/org/repo/pull/1/files#diff-schema.graphql",
		});
	});
});
