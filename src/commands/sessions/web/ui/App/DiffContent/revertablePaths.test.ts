import { describe, expect, it } from "vitest";
import { revertablePaths } from "./revertablePaths";

describe("revertablePaths", () => {
	it("keeps every path when there is no uncommitted filter", () => {
		expect(revertablePaths(["a.ts", "b.ts"], undefined)).toEqual([
			"a.ts",
			"b.ts",
		]);
	});

	it("keeps only the uncommitted paths", () => {
		expect(
			revertablePaths(["a.ts", "b.ts"], {
				paths: new Set(["b.ts"]),
				newPaths: new Set(),
			}),
		).toEqual(["b.ts"]);
	});
});
