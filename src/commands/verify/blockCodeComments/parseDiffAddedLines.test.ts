import { describe, expect, it } from "vitest";
import { parseDiffAddedLines } from "./parseDiffAddedLines";

describe("parseDiffAddedLines", () => {
	it("collects added line numbers per file", () => {
		const diff = [
			"diff --git a/src/foo.ts b/src/foo.ts",
			"index 111..222 100644",
			"--- a/src/foo.ts",
			"+++ b/src/foo.ts",
			"@@ -10,3 +10,5 @@ context",
			" const a = 1;",
			"+const b = 2;",
			"+const c = 3;",
			" const d = 4;",
		].join("\n");

		const result = parseDiffAddedLines(diff);

		expect([...(result.get("src/foo.ts") ?? [])]).toEqual([11, 12]);
	});

	it("does not advance the new-line counter on removed lines", () => {
		const diff = [
			"--- a/src/bar.ts",
			"+++ b/src/bar.ts",
			"@@ -5,4 +5,3 @@",
			" keep;",
			"-removed;",
			"+added;",
			" keep2;",
		].join("\n");

		const result = parseDiffAddedLines(diff);

		expect([...(result.get("src/bar.ts") ?? [])]).toEqual([6]);
	});

	it("ignores deleted files (+++ /dev/null)", () => {
		const diff = [
			"--- a/src/gone.ts",
			"+++ /dev/null",
			"@@ -1,2 +0,0 @@",
			"-line one;",
			"-line two;",
		].join("\n");

		const result = parseDiffAddedLines(diff);

		expect(result.size).toBe(0);
	});

	it("tracks multiple files and hunks independently", () => {
		const diff = [
			"+++ b/src/a.ts",
			"@@ -1,1 +1,2 @@",
			" x;",
			"+y;",
			"+++ b/src/b.ts",
			"@@ -20,1 +20,2 @@",
			" z;",
			"+w;",
		].join("\n");

		const result = parseDiffAddedLines(diff);

		expect([...(result.get("src/a.ts") ?? [])]).toEqual([2]);
		expect([...(result.get("src/b.ts") ?? [])]).toEqual([21]);
	});
});
