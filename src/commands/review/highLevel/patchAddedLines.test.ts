import { describe, expect, it } from "vitest";
import { patchAddedLines } from "./patchAddedLines";

describe("patchAddedLines", () => {
	it("numbers added lines on the new side, skipping removed ones", () => {
		const patch = [
			"@@ -1,3 +1,3 @@",
			" keep",
			"-old",
			"+new",
			" keep",
			"@@ -20,2 +20,3 @@",
			" keep",
			"+added",
			String.raw`\ No newline at end of file`,
		].join("\n");

		expect([...patchAddedLines(patch)]).toEqual([2, 21]);
	});
});
