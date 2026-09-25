import type { FileData } from "react-diff-view";
import { describe, expect, it } from "vitest";
import { buildDiffFileTree } from "./buildDiffFileTree";

function file(path: string): FileData {
	return {
		oldPath: path,
		newPath: path,
		type: "modify",
		hunks: [],
	} as unknown as FileData;
}

const noCounts = { isNew: false, added: 0, removed: 0 };

describe("buildDiffFileTree", () => {
	it("nests files by directory", () => {
		const tree = buildDiffFileTree([file("src/a.ts"), file("src/b/c.ts")]);

		expect(tree).toEqual([
			{
				kind: "dir",
				name: "src",
				path: "src",
				children: [
					{
						kind: "dir",
						name: "b",
						path: "src/b",
						children: [
							{
								kind: "file",
								name: "c.ts",
								path: "src/b/c.ts",
								fileKey: "src/b/c.ts",
								...noCounts,
							},
						],
					},
					{
						kind: "file",
						name: "a.ts",
						path: "src/a.ts",
						fileKey: "src/a.ts",
						...noCounts,
					},
				],
			},
		]);
	});

	it("collapses single-child directory chains into one row", () => {
		const tree = buildDiffFileTree([file("src/commands/web/ui/App.tsx")]);

		expect(tree).toEqual([
			{
				kind: "dir",
				name: "src/commands/web/ui",
				path: "src/commands/web/ui",
				children: [
					{
						kind: "file",
						name: "App.tsx",
						path: "src/commands/web/ui/App.tsx",
						fileKey: "src/commands/web/ui/App.tsx",
						...noCounts,
					},
				],
			},
		]);
	});

	it("stops collapsing at a directory holding a file", () => {
		const tree = buildDiffFileTree([
			file("src/web/ui/App.tsx"),
			file("src/web/server.ts"),
		]);

		expect(tree.map((node) => node.name)).toEqual(["src/web"]);
		const [web] = tree;
		expect(web.kind === "dir" && web.children.map((node) => node.name)).toEqual(
			["ui", "server.ts"],
		);
	});

	it("sorts directories before files, each alphabetically", () => {
		const tree = buildDiffFileTree([
			file("z.ts"),
			file("a.ts"),
			file("zeta/x/one.ts"),
			file("alpha/y/two.ts"),
		]);

		expect(tree.map((node) => node.name)).toEqual([
			"alpha/y",
			"zeta/x",
			"a.ts",
			"z.ts",
		]);
	});

	it("carries each file's added and removed line counts", () => {
		const tree = buildDiffFileTree([
			{
				oldPath: "a.ts",
				newPath: "a.ts",
				type: "modify",
				hunks: [
					{
						changes: [
							{ type: "insert" },
							{ type: "insert" },
							{ type: "delete" },
							{ type: "normal" },
						],
					},
				],
			} as unknown as FileData,
		]);

		expect(tree).toEqual([
			{
				kind: "file",
				name: "a.ts",
				path: "a.ts",
				fileKey: "a.ts",
				isNew: false,
				added: 2,
				removed: 1,
			},
		]);
	});

	it("keys files by their new path when a file was renamed", () => {
		const tree = buildDiffFileTree([
			{
				oldPath: "old.ts",
				newPath: "new.ts",
				type: "rename",
			} as unknown as FileData,
		]);

		expect(tree).toEqual([
			{
				kind: "file",
				name: "new.ts",
				path: "new.ts",
				fileKey: "new.ts",
				...noCounts,
			},
		]);
	});

	it("keys deleted files by their old path", () => {
		const tree = buildDiffFileTree([
			{
				oldPath: "gone.ts",
				newPath: "/dev/null",
				type: "delete",
			} as unknown as FileData,
		]);

		expect(tree).toEqual([
			{
				kind: "file",
				name: "gone.ts",
				path: "gone.ts",
				fileKey: "gone.ts",
				...noCounts,
			},
		]);
	});

	it("marks an added file as new", () => {
		const tree = buildDiffFileTree([
			{
				oldPath: "/dev/null",
				newPath: "fresh.ts",
				type: "add",
			} as unknown as FileData,
		]);

		expect(tree).toEqual([
			{
				kind: "file",
				name: "fresh.ts",
				path: "fresh.ts",
				fileKey: "fresh.ts",
				isNew: true,
				added: 0,
				removed: 0,
			},
		]);
	});

	it("returns an empty tree for no files", () => {
		expect(buildDiffFileTree([])).toEqual([]);
	});
});
