import { describe, expect, it } from "vitest";
import { collectHashComments } from "./collectHashComments";

describe("collectHashComments", () => {
	it("collects a full-line comment with its line number", () => {
		const content = ["FROM node", "# install deps", "RUN npm ci"].join("\n");
		expect(collectHashComments(content, { skipHeader: false })).toEqual([
			{ line: 2, text: "# install deps" },
		]);
	});

	it("collects a trailing comment", () => {
		const content = "KEY=value # explain the key";
		expect(collectHashComments(content, { skipHeader: false })).toEqual([
			{ line: 1, text: "# explain the key" },
		]);
	});

	it("ignores a # inside a quoted string", () => {
		const content = 'COLOR="#ff0000"';
		expect(collectHashComments(content, { skipHeader: false })).toEqual([]);
	});

	it("skips the shell leading header block", () => {
		const content = [
			"#!/bin/bash",
			"# describe this script",
			"",
			"echo hi",
			"# stray note",
		].join("\n");
		expect(collectHashComments(content, { skipHeader: true })).toEqual([
			{ line: 5, text: "# stray note" },
		]);
	});

	it("ends the header at the first code line", () => {
		const content = ["echo hi", "# not a header"].join("\n");
		expect(collectHashComments(content, { skipHeader: true })).toEqual([
			{ line: 2, text: "# not a header" },
		]);
	});
});
