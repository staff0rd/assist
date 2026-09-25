import type { FileData } from "react-diff-view";
import { describe, expect, it } from "vitest";
import {
	buildDiffFileTree,
	type DiffFileTreeNode,
} from "../../buildDiffFileTree";
import { filePath } from "../../FileDiff";
import { orderFilesByTree } from "./orderFilesByTree";

function file(path: string): FileData {
	return {
		oldPath: path,
		newPath: path,
		type: "modify",
		hunks: [],
	} as unknown as FileData;
}

function treePaths(nodes: DiffFileTreeNode[]): string[] {
	return nodes.flatMap((node) =>
		node.kind === "file" ? [node.fileKey] : treePaths(node.children),
	);
}

describe("orderFilesByTree", () => {
	it("orders files the way the tree lists them", () => {
		const files = [
			file("z.ts"),
			file("a.ts"),
			file("zeta/x/one.ts"),
			file("alpha/y/two.ts"),
		];

		expect(orderFilesByTree(files).map(filePath)).toEqual([
			"alpha/y/two.ts",
			"zeta/x/one.ts",
			"a.ts",
			"z.ts",
		]);
	});

	it("matches the tree's own file order for a nested diff", () => {
		const files = [
			file("src/b/c.ts"),
			file("src/a.ts"),
			file("README.md"),
			file("src/b/a.ts"),
		];

		expect(orderFilesByTree(files).map(filePath)).toEqual(
			treePaths(buildDiffFileTree(files)),
		);
	});

	it("keeps every file when a path appears twice", () => {
		const files = [file("dup.ts"), file("dup.ts"), file("a/b.ts")];

		expect(orderFilesByTree(files).map(filePath)).toEqual([
			"a/b.ts",
			"dup.ts",
			"dup.ts",
		]);
	});

	it("returns an empty list for no files", () => {
		expect(orderFilesByTree([])).toEqual([]);
	});
});
