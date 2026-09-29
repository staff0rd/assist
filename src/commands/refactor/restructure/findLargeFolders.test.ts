import { describe, expect, it } from "vitest";
import { findLargeFolders } from "./findLargeFolders";

describe("findLargeFolders", () => {
	it("lists folders holding more than the limit, largest first, skipping the root", () => {
		const targets = [
			"/r/a.ts",
			"/r/b.ts",
			"/r/c.ts",
			"/r/A/x.ts",
			"/r/A/y.ts",
			"/r/A/B/z.ts",
			"/r/C/p.ts",
			"/r/C/q.ts",
			"/r/C/s.ts",
		];

		expect(findLargeFolders(targets, "/r", 1)).toEqual([
			{ folder: "C", files: 3 },
			{ folder: "A", files: 2 },
		]);
	});

	it("counts only files directly in a folder", () => {
		expect(
			findLargeFolders(["/r/A/x.ts", "/r/A/B/y.ts", "/r/A/B/z.ts"], "/r", 1),
		).toEqual([{ folder: "A/B", files: 2 }]);
	});
});
