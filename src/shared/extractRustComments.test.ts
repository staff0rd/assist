import { describe, expect, it } from "vitest";
import { extractRustComments } from "./extractRustComments";

function texts(content: string): string[] {
	return extractRustComments(content).map((comment) => comment.text);
}

describe("extractRustComments", () => {
	it("finds a line comment", () => {
		expect(texts("let a = 1; // note")).toEqual(["// note"]);
	});

	it("finds outer and inner doc comments", () => {
		expect(texts("//! Crate docs.\n/// Runs it.\nfn run() {}")).toEqual([
			"//! Crate docs.",
			"/// Runs it.",
		]);
	});

	it("finds a block comment spanning lines", () => {
		expect(texts("/*\n note\n*/\nlet a = 1;")).toEqual(["/*\n note\n*/"]);
	});

	it("keeps a nested block comment whole", () => {
		expect(texts("/* outer /* inner */ still */ let a = 1;")).toEqual([
			"/* outer /* inner */ still */",
		]);
	});

	it("reports the line each comment starts on", () => {
		expect(extractRustComments("let a = 1;\nlet b = 2; // two\n")).toEqual([
			{ line: 2, text: "// two" },
		]);
	});

	it("ignores comment markers inside a string", () => {
		expect(texts('let url = "https://example.com /* x */";')).toEqual([]);
	});

	it("ignores an escaped quote inside a string", () => {
		expect(texts(String.raw`let s = "a \" // b";`)).toEqual([]);
	});

	it("ignores comment markers inside raw strings", () => {
		expect(
			texts('let a = r"// a";\nlet b = r#"say "// b""#;\nlet c = br##"/*"##;'),
		).toEqual([]);
	});

	it("ignores comment markers inside byte strings", () => {
		expect(texts('let a = b"// a";')).toEqual([]);
	});

	it("does not treat a lifetime as a char literal", () => {
		expect(texts("fn f<'a>(s: &'a str) -> &'a str { s } // note")).toEqual([
			"// note",
		]);
	});

	it("ignores a quote char literal", () => {
		expect(texts('let q = \'"\'; // note\nlet s = "//";')).toEqual(["// note"]);
	});

	it("does not treat a raw identifier as a raw string", () => {
		expect(texts("let r#type = 1; // note")).toEqual(["// note"]);
	});

	it("returns nothing for code without comments", () => {
		expect(texts("let a = 1;\nlet b = a / 2;")).toEqual([]);
	});
});
