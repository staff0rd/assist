import { describe, expect, it } from "vitest";
import { clusterDirectories } from "./clusterDirectories";
import type { ImportEdge, ImportGraph } from "./types";

function makeGraph(files: string[], edges: ImportEdge[]): ImportGraph {
	return {
		files: new Set(files),
		edges,
		importedBy: new Map(),
		imports: new Map(),
	};
}

describe("clusterDirectories", () => {
	describe("when a directory is imported by exactly one other directory", () => {
		it("should cluster it under that parent", () => {
			const graph = makeGraph(
				["src/utils/helper.ts"],
				[
					{
						source: "src/commands/foo.ts",
						target: "src/utils/helper.ts",
						specifier: "../utils/helper",
					},
				],
			);

			const result = clusterDirectories(graph);

			expect(result.get("src/commands")).toEqual(["src/utils"]);
		});
	});

	describe("when a directory is imported by multiple directories", () => {
		it("should not cluster it", () => {
			const graph = makeGraph(
				["src/utils/helper.ts"],
				[
					{
						source: "src/commands/foo.ts",
						target: "src/utils/helper.ts",
						specifier: "../utils/helper",
					},
					{
						source: "src/lib/bar.ts",
						target: "src/utils/helper.ts",
						specifier: "../utils/helper",
					},
				],
			);

			const result = clusterDirectories(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when source and target are in the same directory", () => {
		it("should not create a cluster", () => {
			const graph = makeGraph(
				["src/commands/helper.ts"],
				[
					{
						source: "src/commands/foo.ts",
						target: "src/commands/helper.ts",
						specifier: "./helper",
					},
				],
			);

			const result = clusterDirectories(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when the target is an ancestor of the parent", () => {
		it("should not cluster", () => {
			const graph = makeGraph(
				["src/helper.ts"],
				[
					{
						source: "src/commands/sub/foo.ts",
						target: "src/helper.ts",
						specifier: "../../helper",
					},
				],
			);

			const result = clusterDirectories(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when the parent is an ancestor of the child", () => {
		it("should not cluster", () => {
			const graph = makeGraph(
				["src/commands/sub/helper.ts"],
				[
					{
						source: "src/commands/foo.ts",
						target: "src/commands/sub/helper.ts",
						specifier: "./sub/helper",
					},
				],
			);

			const result = clusterDirectories(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when the target file is not in the graph files set", () => {
		it("should ignore the edge", () => {
			const graph = makeGraph(
				[],
				[
					{
						source: "src/commands/foo.ts",
						target: "src/utils/helper.ts",
						specifier: "../utils/helper",
					},
				],
			);

			const result = clusterDirectories(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when a child directory is also a cluster parent", () => {
		it("should filter it out leaving only non-parent children", () => {
			const graph = makeGraph(
				["src/b/helper.ts", "src/c/util.ts", "src/d/extra.ts"],
				[
					{
						source: "src/a/foo.ts",
						target: "src/b/helper.ts",
						specifier: "../b/helper",
					},
					{
						source: "src/a/foo.ts",
						target: "src/d/extra.ts",
						specifier: "../d/extra",
					},
					{
						source: "src/b/bar.ts",
						target: "src/c/util.ts",
						specifier: "../c/util",
					},
				],
			);

			const result = clusterDirectories(graph);

			// src/b is a cluster parent (owns src/c), so should be filtered from src/a's children
			// src/d is not a cluster parent, so remains
			expect(result.has("src/a")).toBe(true);
			expect(result.get("src/a")).toEqual(["src/d"]);
			expect(result.has("src/b")).toBe(true);
			expect(result.get("src/b")).toEqual(["src/c"]);
		});
	});
});
