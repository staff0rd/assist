import { describe, expect, it } from "vitest";
import { parseItemLink } from "./parseItemLink";

describe("parseItemLink", () => {
	it.each([
		["https://github.com/o/r/issues/7", 7],
		["https://github.com/o/r/pull/8", 8],
		["https://github.com/o/r/pull/9/#discussion", 9],
	])("parses %s", (href, number) => {
		expect(parseItemLink(href)).toEqual({ owner: "o", repo: "r", number });
	});

	it.each([
		"https://github.com/o/r/pull/9/files",
		"https://github.com/o/r/pulls",
		"https://example.com/o/r/pull/9",
	])("ignores %s", (href) => {
		expect(parseItemLink(href)).toBeNull();
	});
});
