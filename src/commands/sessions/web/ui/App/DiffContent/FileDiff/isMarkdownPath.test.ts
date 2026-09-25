import { describe, expect, it } from "vitest";
import { isMarkdownPath } from "./isMarkdownPath";

describe("isMarkdownPath", () => {
	it("accepts .md and .markdown regardless of case", () => {
		expect(isMarkdownPath("docs/readme.md")).toBe(true);
		expect(isMarkdownPath("NOTES.MD")).toBe(true);
		expect(isMarkdownPath("docs/guide.markdown")).toBe(true);
	});

	it("rejects other extensions", () => {
		expect(isMarkdownPath("src/index.ts")).toBe(false);
		expect(isMarkdownPath("diagram.mmd")).toBe(false);
		expect(isMarkdownPath("mdfile")).toBe(false);
		expect(isMarkdownPath("weird.md.ts")).toBe(false);
	});
});
