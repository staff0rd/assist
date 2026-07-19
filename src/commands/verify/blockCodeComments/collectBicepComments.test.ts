import { describe, expect, it } from "vitest";
import { collectBicepComments } from "./collectBicepComments";

describe("collectBicepComments", () => {
	it("collects a full-line // comment with its line number", () => {
		const content = [
			"param name string",
			"// describe the param",
			"var x = 1",
		].join("\n");
		expect(collectBicepComments(content)).toEqual([
			{ line: 2, text: "// describe the param" },
		]);
	});

	it("collects a trailing // comment", () => {
		const content = "var region = 'eastus' // the primary region";
		expect(collectBicepComments(content)).toEqual([
			{ line: 1, text: "// the primary region" },
		]);
	});

	it("collects a block comment reporting its start line", () => {
		const content = [
			"param a int",
			"/* a block",
			"spanning lines */",
			"var b = 2",
		].join("\n");
		expect(collectBicepComments(content)).toEqual([
			{ line: 2, text: "/* a block\nspanning lines */" },
		]);
	});

	it("ignores // inside a single-quoted string literal", () => {
		const content = "var url = 'https://example.com'";
		expect(collectBicepComments(content)).toEqual([]);
	});

	it("ignores /* inside a single-quoted string literal", () => {
		const content = "var glob = '/*.txt'";
		expect(collectBicepComments(content)).toEqual([]);
	});

	it("ignores comment markers inside a triple-quoted string", () => {
		const content = ["var doc = '''", "// not a comment", "'''"].join("\n");
		expect(collectBicepComments(content)).toEqual([]);
	});
});
