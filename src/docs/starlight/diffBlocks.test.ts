import { describe, expect, it } from "vitest";
import { type DiffBlock, diffBlocks } from "./diffBlocks";

const block = (key: string): DiffBlock<string> => ({ key, node: key });
const container = (
	name: string,
	kind: string,
	children: string[],
): DiffBlock<string> => ({
	key: `${name}:${children.join(",")}`,
	node: name,
	container: kind,
	children: children.map(block),
});
const blocks = (...keys: string[]) => keys.map(block);

describe("diffBlocks", () => {
	it("reports nothing for identical blocks", () => {
		expect(diffBlocks(blocks("a", "b"), blocks("a", "b"))).toEqual({
			added: [],
			removed: [],
		});
	});

	it("marks inserted blocks as added", () => {
		expect(diffBlocks(blocks("a", "c"), blocks("a", "b", "c")).added).toEqual([
			"b",
		]);
	});

	it("puts a changed block's old version before its new one", () => {
		expect(diffBlocks(blocks("a", "b", "c"), blocks("a", "B", "c"))).toEqual({
			added: ["B"],
			removed: [{ nodes: ["b"], before: "B" }],
		});
	});

	it("puts a deleted block after the block preceding it", () => {
		expect(diffBlocks(blocks("a", "b", "c"), blocks("a", "c")).removed).toEqual(
			[{ nodes: ["b"], after: "a" }],
		);
		expect(diffBlocks(blocks("a", "b"), blocks("a")).removed).toEqual([
			{ nodes: ["b"], after: "a" },
		]);
	});

	it("appends removed blocks to the parent when nothing is left", () => {
		expect(diffBlocks(blocks("a"), []).removed).toEqual([
			{ nodes: ["a"], parent: undefined },
		]);
	});

	it("keeps consecutive removals together in order", () => {
		expect(
			diffBlocks(blocks("a", "b", "c", "d"), blocks("a", "d")).removed,
		).toEqual([{ nodes: ["b", "c"], after: "a" }]);
	});

	it("diffs the items of a changed list rather than the whole list", () => {
		const diff = diffBlocks(
			[block("intro"), container("old", "list", ["x", "y", "z"])],
			[block("intro"), container("new", "list", ["x", "Y", "z", "w"])],
		);
		expect(diff).toEqual({
			added: ["Y", "w"],
			removed: [{ nodes: ["y"], before: "Y" }],
		});
	});

	it("appends removed rows after the last row", () => {
		const diff = diffBlocks(
			[container("old", "table", ["head", "r1", "r2"])],
			[container("new", "table", ["head", "r1"])],
		);
		expect(diff.removed).toEqual([{ nodes: ["r2"], after: "r1" }]);
	});

	it("does not pair containers of different kinds", () => {
		const diff = diffBlocks(
			[container("old", "list:false", ["x"])],
			[container("new", "list:true", ["x"])],
		);
		expect(diff).toEqual({
			added: ["new"],
			removed: [{ nodes: ["old"], before: "new" }],
		});
	});
});
