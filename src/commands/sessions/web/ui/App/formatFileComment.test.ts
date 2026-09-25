import { describe, expect, it } from "vitest";
import { formatFileComment } from "./formatFileComment";

describe("formatFileComment", () => {
	it("carries the line range when the quote was located", () => {
		expect(
			formatFileComment({
				path: "docs/a.md",
				lines: { start: 12, end: 15 },
				quote: "the quoted text",
				note: "tighten this",
			}),
		).toBe("docs/a.md:12-15\n\n```\nthe quoted text\n```\n\ntighten this");
	});

	it("collapses a single-line range", () => {
		expect(
			formatFileComment({
				path: "docs/a.md",
				lines: { start: 4, end: 4 },
				quote: "one line",
				note: "why",
			}),
		).toBe("docs/a.md:4\n\n```\none line\n```\n\nwhy");
	});

	it("carries the path alone when the quote was not located", () => {
		expect(
			formatFileComment({
				path: "docs/a.md",
				lines: null,
				quote: "reflowed table cell",
				note: "why",
			}),
		).toBe("docs/a.md\n\n```\nreflowed table cell\n```\n\nwhy");
	});
});
