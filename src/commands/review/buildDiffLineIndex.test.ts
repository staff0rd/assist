import { describe, expect, it } from "vitest";
import { buildDiffLineIndex } from "./buildDiffLineIndex";

describe("buildDiffLineIndex", () => {
	it("indexes added lines of a new file by their new-file line number", () => {
		const diff = [
			"diff --git a/src/new.ts b/src/new.ts",
			"new file mode 100644",
			"--- /dev/null",
			"+++ b/src/new.ts",
			"@@ -0,0 +1,3 @@",
			"+line one",
			"+line two",
			"+line three",
		].join("\n");
		const index = buildDiffLineIndex(diff);
		expect([...(index.get("src/new.ts") ?? [])]).toEqual([1, 2, 3]);
	});

	it("excludes lines beyond the diff (the out-of-diff bug)", () => {
		const diff = [
			"--- /dev/null",
			"+++ b/SnapshotJanitor.ts",
			"@@ -0,0 +1,3 @@",
			"+a",
			"+b",
			"+c",
		].join("\n");
		const lines = buildDiffLineIndex(diff).get("SnapshotJanitor.ts");
		expect(lines?.has(376)).toBe(false);
		expect(lines?.has(2)).toBe(true);
	});

	it("includes context lines and skips removed lines", () => {
		const diff = [
			"--- a/src/mod.ts",
			"+++ b/src/mod.ts",
			"@@ -10,4 +10,4 @@",
			" context ten",
			"-removed eleven",
			"+added eleven",
			" context twelve",
			" context thirteen",
		].join("\n");
		const lines = buildDiffLineIndex(diff).get("src/mod.ts");
		expect([...(lines ?? [])].sort((a, b) => a - b)).toEqual([10, 11, 12, 13]);
	});
});
