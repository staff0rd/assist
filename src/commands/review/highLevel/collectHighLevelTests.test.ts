import { describe, expect, it } from "vitest";
import { collectHighLevelTests } from "./collectHighLevelTests";
import type { HighLevelFile } from "./types";

function file(
	path: string,
	status: HighLevelFile["status"] = "modified",
): HighLevelFile {
	return { path, status, additions: 1, deletions: 0, diffUrl: `#${path}` };
}

describe("collectHighLevelTests", () => {
	it("reads each matching test file through the given reader", () => {
		const read: string[] = [];
		const tests = collectHighLevelTests(
			[
				file("src/a.test.ts"),
				file("src/a.ts"),
				file("src/b.test.ts", "removed"),
			],
			["**/*.test.ts"],
			{
				head: (path) => {
					read.push(path);
					return `it("from head", () => {});`;
				},
				base: () => "",
			},
		);
		expect(read).toEqual(["src/a.test.ts"]);
		expect(tests.map((test) => test.path)).toEqual(["src/a.test.ts"]);
		expect(tests[0]?.tests[0]).toMatchObject({ kind: "it", name: "from head" });
	});

	it("propagates a reader failure instead of skipping the file", () => {
		expect(() =>
			collectHighLevelTests([file("src/a.test.ts")], ["**/*.test.ts"], {
				head: () => {
					throw new Error("unreadable");
				},
				base: () => "",
			}),
		).toThrow("unreadable");
	});

	it("reads the base under a renamed file's previous path and lists tests it dropped", () => {
		const baseRead: string[] = [];
		const tests = collectHighLevelTests(
			[
				{
					...file("src/new.test.ts"),
					previousPath: "src/old.test.ts",
					patch:
						'@@ -1,2 +1,1 @@\n it("kept", () => {});\n-it("gone", () => {});',
				},
			],
			["**/*.test.ts"],
			{
				head: () => 'it("kept", () => {});\n',
				base: (changed) => {
					baseRead.push(changed.previousPath ?? changed.path);
					return 'it("kept", () => {});\nit("gone", () => {});\n';
				},
			},
		);

		expect(baseRead).toEqual(["src/old.test.ts"]);
		expect(tests[0]?.tests).toEqual([
			{
				kind: "it",
				id: "src/new.test.ts:base:2",
				name: "gone",
				line: 2,
				change: "removed",
				source: 'it("gone", () => {})',
			},
		]);
	});
});
