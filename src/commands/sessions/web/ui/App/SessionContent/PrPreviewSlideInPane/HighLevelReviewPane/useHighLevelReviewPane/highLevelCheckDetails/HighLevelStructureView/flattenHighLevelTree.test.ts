import { describe, expect, it } from "vitest";
import { flattenHighLevelTree } from "./flattenHighLevelTree";
import { highLevelTreeFixture } from "../../highLevelTreeFixture";

describe("flattenHighLevelTree", () => {
	it("lists the files depth-first in the order the tree renders them", () => {
		expect(
			flattenHighLevelTree(highLevelTreeFixture).map((file) => file.path),
		).toEqual(["src/lib/util.ts", "src/app.ts", "README.md"]);
	});

	it("returns no files for an empty tree", () => {
		expect(flattenHighLevelTree([])).toEqual([]);
	});
});
