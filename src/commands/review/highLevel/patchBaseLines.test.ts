import { describe, expect, it } from "vitest";
import { patchBaseLines } from "./patchBaseLines";

describe("patchBaseLines", () => {
	const patch =
		"@@ -2,3 +2,4 @@\n a\n-b\n+c\n+d\n e\n@@ -20,2 +21,1 @@\n f\n-g";

	it("collects the base line numbers the patch removes", () => {
		expect([...patchBaseLines(patch).removed]).toEqual([3, 21]);
	});

	it("maps base lines to head positions inside, between and after hunks", () => {
		const { toHead } = patchBaseLines(patch);

		expect([1, 2, 3, 4, 10, 20, 21, 30].map(toHead)).toEqual([
			1, 2, 3, 5, 11, 21, 22, 30,
		]);
	});
});
