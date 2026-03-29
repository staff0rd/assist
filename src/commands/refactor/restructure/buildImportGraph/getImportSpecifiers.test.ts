import { describe, expect, it } from "vitest";
import ts from "typescript";
import { getImportSpecifiers } from "./getImportSpecifiers";

function parse(code: string): ts.SourceFile {
	return ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
}

describe("getImportSpecifiers", () => {
	describe("when given a static import", () => {
		it("should return the specifier", () => {
			const sf = parse('import { foo } from "./foo";');

			expect(getImportSpecifiers(sf)).toEqual(["./foo"]);
		});
	});

	describe("when given multiple imports", () => {
		it("should return all specifiers", () => {
			const sf = parse(
				'import { a } from "./a";\nimport { b } from "./b";',
			);

			expect(getImportSpecifiers(sf)).toEqual(["./a", "./b"]);
		});
	});

	describe("when given an export from declaration", () => {
		it("should return the specifier", () => {
			const sf = parse('export { foo } from "./foo";');

			expect(getImportSpecifiers(sf)).toEqual(["./foo"]);
		});
	});

	describe("when given a dynamic import", () => {
		it("should return the specifier", () => {
			const sf = parse('const m = import("./dynamic");');

			expect(getImportSpecifiers(sf)).toEqual(["./dynamic"]);
		});
	});

	describe("when given no imports", () => {
		it("should return empty array", () => {
			const sf = parse("const x = 1;");

			expect(getImportSpecifiers(sf)).toEqual([]);
		});
	});
});
