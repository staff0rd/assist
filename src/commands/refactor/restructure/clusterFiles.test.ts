import { describe, expect, it } from "vitest";
import { clusterFiles } from "./clusterFiles";
import type { ImportGraph } from "./types";

function makeGraph(files: string[], edges: [string, string][]): ImportGraph {
	const importedBy = new Map<string, Set<string>>();
	const imports = new Map<string, Set<string>>();

	for (const [source, target] of edges) {
		if (!importedBy.has(target)) importedBy.set(target, new Set());
		importedBy.get(target)?.add(source);
		if (!imports.has(source)) imports.set(source, new Set());
		imports.get(source)?.add(target);
	}

	return {
		files: new Set(files),
		edges: edges.map(([source, target]) => ({
			source,
			target,
			specifier: `./${target}`,
		})),
		importedBy,
		imports,
	};
}

describe("clusterFiles", () => {
	describe("when a file is imported by exactly one parent in the same directory", () => {
		it("should cluster the file under its parent", () => {
			const graph = makeGraph(
				["src/parent.ts", "src/child.ts"],
				[["src/parent.ts", "src/child.ts"]],
			);

			const result = clusterFiles(graph);

			expect(result.get("src/parent.ts")).toEqual(["src/child.ts"]);
		});
	});

	describe("when a file is imported by multiple parents", () => {
		it("should not cluster the file", () => {
			const graph = makeGraph(
				["src/a.ts", "src/b.ts", "src/shared.ts"],
				[
					["src/a.ts", "src/shared.ts"],
					["src/b.ts", "src/shared.ts"],
				],
			);

			const result = clusterFiles(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when the file is an index file", () => {
		it("should not cluster index files", () => {
			const graph = makeGraph(
				["src/parent.ts", "src/index.ts"],
				[["src/parent.ts", "src/index.ts"]],
			);

			const result = clusterFiles(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when the parent is an index file", () => {
		it("should not cluster under an index parent", () => {
			const graph = makeGraph(
				["src/index.ts", "src/child.ts"],
				[["src/index.ts", "src/child.ts"]],
			);

			const result = clusterFiles(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when the parent is in a different directory", () => {
		it("should not cluster across directories", () => {
			const graph = makeGraph(
				["src/a/parent.ts", "src/b/child.ts"],
				[["src/a/parent.ts", "src/b/child.ts"]],
			);

			const result = clusterFiles(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when there is a chain of single-import files", () => {
		it("should cluster under the root parent", () => {
			const graph = makeGraph(
				["src/root.ts", "src/mid.ts", "src/leaf.ts"],
				[
					["src/root.ts", "src/mid.ts"],
					["src/mid.ts", "src/leaf.ts"],
				],
			);

			const result = clusterFiles(graph);

			expect(result.get("src/root.ts")).toContain("src/mid.ts");
			expect(result.get("src/root.ts")).toContain("src/leaf.ts");
		});
	});

	describe("when given an empty graph", () => {
		it("should return an empty map", () => {
			const graph = makeGraph([], []);

			const result = clusterFiles(graph);

			expect(result.size).toBe(0);
		});
	});

	describe("when the parent file is not in the graph files set", () => {
		it("should not cluster the file", () => {
			const graph: ImportGraph = {
				files: new Set(["src/child.ts"]),
				edges: [],
				importedBy: new Map([["src/child.ts", new Set(["src/external.ts"])]]),
				imports: new Map(),
			};

			const result = clusterFiles(graph);

			expect(result.size).toBe(0);
		});
	});
});
