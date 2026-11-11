import { describe, expect, it } from "vitest";
import { refineItemId } from "./refineItemId";

describe("refineItemId", () => {
	it("reads the item id from a refine launch", () => {
		expect(refineItemId(["refine", "--once", "a7"])).toBe(7);
		expect(refineItemId(["refine", "--once", "--harness", "codex", "a7"])).toBe(
			7,
		);
	});

	it("ignores other commands and refine without an item", () => {
		expect(refineItemId(["backlog", "run", "a7"])).toBeUndefined();
		expect(refineItemId(["refine"])).toBeUndefined();
		expect(refineItemId(["refine", "--once"])).toBeUndefined();
		expect(refineItemId(undefined)).toBeUndefined();
	});
});
