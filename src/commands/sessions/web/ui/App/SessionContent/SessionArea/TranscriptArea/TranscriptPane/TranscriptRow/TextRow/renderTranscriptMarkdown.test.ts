import { describe, expect, it } from "vitest";
import { renderTranscriptMarkdown } from "./renderTranscriptMarkdown";

describe("renderTranscriptMarkdown", () => {
	it("renders bold, tables and inline code", () => {
		const html = renderTranscriptMarkdown(
			"**Yes.** `x`\n\n| a | b |\n|---|---|\n| 1 | 2 |",
		);
		expect(html).toContain("<strong>Yes.</strong>");
		expect(html).toContain("<code>x</code>");
		expect(html).toContain("<table>");
	});

	it("escapes raw html instead of injecting it", () => {
		const html = renderTranscriptMarkdown('<img src=x onerror="alert(1)">');
		expect(html).not.toContain("<img");
		expect(html).toContain("&lt;img");
	});
});
