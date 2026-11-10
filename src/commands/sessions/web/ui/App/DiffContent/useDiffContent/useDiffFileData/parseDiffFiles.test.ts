import { describe, expect, it } from "vitest";
import { parseDiffFiles } from "./parseDiffFiles";

describe("parseDiffFiles", () => {
	it("drops the tab git appends to names containing spaces", () => {
		const diff = [
			"diff --git a/sp ace b/sp ace",
			"index 587be6b..df18491 100644",
			"--- a/sp ace\t",
			"+++ b/sp ace\t",
			"@@ -1 +1,2 @@",
			" x",
			"+y",
			"",
		].join("\n");

		const [file] = parseDiffFiles(diff);

		expect(file.oldPath).toBe("sp ace");
		expect(file.newPath).toBe("sp ace");
	});

	it("flags only the files git reports as binary", () => {
		const diff = [
			"diff --git a/logo.png b/logo.png",
			"index 1111111..2222222 100644",
			"Binary files a/logo.png and b/logo.png differ",
			"diff --git a/old.tsx b/new.tsx",
			"similarity index 100%",
			"rename from old.tsx",
			"rename to new.tsx",
			"diff --git a/notes.txt b/notes.txt",
			"index 587be6b..df18491 100644",
			"--- a/notes.txt",
			"+++ b/notes.txt",
			"@@ -1 +1,2 @@",
			" x",
			"+Binary files a and b differ",
			"",
		].join("\n");

		expect(parseDiffFiles(diff).map((file) => file.isBinary)).toEqual([
			true,
			undefined,
			undefined,
		]);
	});
});
