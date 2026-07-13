import { describe, expect, it } from "vitest";
import { extractComments, isSourceFile } from "./extractComments";

describe("extractComments", () => {
	it("finds a line comment", () => {
		expect(extractComments("const a = 1; // note")).toEqual(["// note"]);
	});

	it("finds a block comment", () => {
		expect(extractComments("/* note */ const a = 1;")).toEqual(["/* note */"]);
	});

	it("finds a multi-line block comment", () => {
		expect(extractComments("/*\n note\n line\n*/")).toEqual([
			"/* note line */",
		]);
	});

	it("ignores // inside a double-quoted string", () => {
		expect(extractComments('const url = "https://example.com";')).toEqual([]);
	});

	it("ignores // inside a single-quoted string", () => {
		expect(extractComments("const s = 'a // b';")).toEqual([]);
	});

	it("ignores /* inside a string", () => {
		expect(extractComments('const s = "/* not a comment */";')).toEqual([]);
	});

	it("ignores comment text inside a template literal", () => {
		expect(extractComments("const s = `// not a comment`;")).toEqual([]);
	});

	it("returns nothing for code without comments", () => {
		expect(extractComments("const a = 1;\nconst b = 2;")).toEqual([]);
	});

	it("exempts machine directives", () => {
		expect(
			extractComments("// oxlint-disable-next-line no-explicit-any"),
		).toEqual([]);
		expect(extractComments("// @ts-expect-error legacy api")).toEqual([]);
	});

	it("finds multiple comments", () => {
		const comments = extractComments("a; // one\nb; /* two */");
		expect(comments).toHaveLength(2);
		expect(comments).toContain("// one");
		expect(comments).toContain("/* two */");
	});
});

describe("isSourceFile", () => {
	it("accepts ts/tsx/js extensions", () => {
		expect(isSourceFile("src/a.ts")).toBe(true);
		expect(isSourceFile("src/a.tsx")).toBe(true);
		expect(isSourceFile("src/a.mjs")).toBe(true);
	});

	it("accepts bicep extensions", () => {
		expect(isSourceFile("main.bicep")).toBe(true);
		expect(isSourceFile("main.bicepparam")).toBe(true);
	});

	it("rejects non-source files", () => {
		expect(isSourceFile("README.md")).toBe(false);
		expect(isSourceFile("config.yml")).toBe(false);
		expect(isSourceFile(undefined)).toBe(false);
	});
});
