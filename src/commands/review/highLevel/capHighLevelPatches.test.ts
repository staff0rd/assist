import { describe, expect, it } from "vitest";
import { capHighLevelPatches } from "./capHighLevelPatches";
import type { HighLevelFile } from "./types";

function hunk(lines: number): string {
	return [`@@ -1,${lines} +1,${lines} @@`, ...Array(lines).fill("+x")].join(
		"\n",
	);
}

function file(path: string, patch: string | undefined): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://github.com/org/repo/pull/1/files#diff-${path}`,
		...(patch === undefined ? {} : { patch }),
	};
}

describe("capHighLevelPatches", () => {
	it("leaves a small patch untouched", () => {
		const files = [file("a.ts", hunk(3))];

		expect(capHighLevelPatches(files, [])).toEqual(files);
	});

	it("drops a patch past the per-file line cap and marks it truncated", () => {
		const [capped] = capHighLevelPatches([file("a.ts", hunk(5000))], []);

		expect(capped?.patch).toBeUndefined();
		expect(capped?.truncated).toBe(true);
	});

	it("keeps whole hunks up to the cap rather than cutting one in half", () => {
		const patch = `${hunk(1000)}\n${hunk(1000)}`;
		const [capped] = capHighLevelPatches([file("a.ts", patch)], []);

		expect(capped?.patch).toBe(hunk(1000));
		expect(capped?.truncated).toBe(true);
	});

	it("spends the total budget on critical files before the rest", () => {
		const crowd = Array.from({ length: 30 }, (_, i) =>
			file(`file-${i}.ts`, hunk(1400)),
		);
		const capped = capHighLevelPatches(
			[...crowd, file("schema.graphql", hunk(1400))],
			["**/*.graphql"],
		);

		expect(capped.at(-1)?.patch).toBeDefined();
		expect(capped.at(-1)?.truncated).toBeUndefined();
		expect(capped.some((entry) => entry.truncated === true)).toBe(true);
	});

	it("returns the files in their original order", () => {
		const capped = capHighLevelPatches(
			[file("a.ts", hunk(2)), file("schema.graphql", hunk(2))],
			["**/*.graphql"],
		);

		expect(capped.map((entry) => entry.path)).toEqual([
			"a.ts",
			"schema.graphql",
		]);
	});

	it("passes a file GitHub gave no patch for straight through", () => {
		const [capped] = capHighLevelPatches([file("logo.png", undefined)], []);

		expect(capped).toEqual(file("logo.png", undefined));
	});
});
