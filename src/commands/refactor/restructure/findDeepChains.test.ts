import { describe, expect, it } from "vitest";
import { findDeepChains } from "./findDeepChains";

const ROOT = "/r";

describe("findDeepChains", () => {
	it("returns no chains when every file is within the limit", () => {
		expect(findDeepChains(["/r/a.ts", "/r/a/b/c.ts"], ROOT, 2)).toEqual([]);
	});

	it("groups files past the limit by their first too-deep folder", () => {
		const chains = findDeepChains(
			[
				"/r/A/B/C/x.ts",
				"/r/A/B/C/D/y.ts",
				"/r/A/B/E/z.ts",
				"/r/A/B/w.ts",
				"/r/A/v.ts",
			],
			ROOT,
			2,
		);

		expect(chains).toEqual([
			{
				folders: [
					{ name: "A", files: 5 },
					{ name: "B", files: 4 },
					{ name: "C", files: 2 },
				],
				tooDeep: 2,
				deepest: 4,
			},
			{
				folders: [
					{ name: "A", files: 5 },
					{ name: "B", files: 4 },
					{ name: "E", files: 1 },
				],
				tooDeep: 1,
				deepest: 3,
			},
		]);
	});

	it("orders chains the same way regardless of input order", () => {
		const files = ["/r/A/B/x.ts", "/r/C/D/y.ts", "/r/E/F/z.ts"];
		expect(findDeepChains([...files].reverse(), ROOT, 1)).toEqual(
			findDeepChains(files, ROOT, 1),
		);
	});
});
