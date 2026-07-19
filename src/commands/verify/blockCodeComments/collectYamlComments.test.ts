import { describe, expect, it } from "vitest";
import { collectYamlComments } from "./collectYamlComments";

describe("collectYamlComments", () => {
	it("collects full-line and trailing comments with line numbers", () => {
		const content = [
			"# full line comment",
			"key: value  # trailing comment",
			"list:",
			"  - item # trailing on item",
		].join("\n");

		expect(collectYamlComments(content)).toEqual([
			{ line: 1, text: "# full line comment" },
			{ line: 2, text: "# trailing comment" },
			{ line: 4, text: "# trailing on item" },
		]);
	});

	it("does not treat # inside quotes, urls, or block scalars as comments", () => {
		const content = [
			"url: http://example.com#anchor",
			'quoted: "a # b"',
			"single: 'c # d'",
			"block: |",
			"  literal # not a comment",
			"  more text",
		].join("\n");

		expect(collectYamlComments(content)).toEqual([]);
	});

	it("flags a yaml-language-server directive like any other comment", () => {
		const content = "# yaml-language-server: $schema=./schema.json";

		expect(collectYamlComments(content)).toEqual([
			{ line: 1, text: "# yaml-language-server: $schema=./schema.json" },
		]);
	});
});
