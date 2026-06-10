import { describe, expect, it } from "vitest";
import { annotateDiffWithLineNumbers } from "./annotateDiffWithLineNumbers";

describe("annotateDiffWithLineNumbers", () => {
	it("numbers added lines of a new file by their new-file line number", () => {
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
		const out = annotateDiffWithLineNumbers(diff).split("\n");
		expect(out).toEqual([
			"        diff --git a/src/new.ts b/src/new.ts",
			"        new file mode 100644",
			"        --- /dev/null",
			"        +++ b/src/new.ts",
			"        @@ -0,0 +1,3 @@",
			"     1  +line one",
			"     2  +line two",
			"     3  +line three",
		]);
	});

	it("numbers context lines and leaves removed lines and headers blank", () => {
		const diff = [
			"--- a/src/mod.ts",
			"+++ b/src/mod.ts",
			"@@ -10,4 +10,4 @@",
			" context ten",
			"-removed eleven",
			"+added eleven",
			" context twelve",
		].join("\n");
		const out = annotateDiffWithLineNumbers(diff).split("\n");
		expect(out[3]).toBe("    10   context ten");
		expect(out[4]).toBe("        -removed eleven");
		expect(out[5]).toBe("    11  +added eleven");
		expect(out[6]).toBe("    12   context twelve");
	});

	it("restarts numbering at each hunk header", () => {
		const diff = [
			"+++ b/src/mod.ts",
			"@@ -1,1 +1,1 @@",
			"+first",
			"@@ -50,1 +50,1 @@",
			"+fiftieth",
		].join("\n");
		const out = annotateDiffWithLineNumbers(diff).split("\n");
		expect(out[2]).toBe("     1  +first");
		expect(out[4]).toBe("    50  +fiftieth");
	});
});
