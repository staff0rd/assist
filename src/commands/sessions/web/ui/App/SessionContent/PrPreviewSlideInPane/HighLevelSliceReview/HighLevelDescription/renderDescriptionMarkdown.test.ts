import { describe, expect, it } from "vitest";
import { renderDescriptionMarkdown } from "./renderDescriptionMarkdown";

describe("renderDescriptionMarkdown", () => {
	it("marks filled What and Why headings as sections and How as optional", () => {
		const html = renderDescriptionMarkdown(
			"## What\nA.\n\n## Why\nB.\n\n## How\nC.",
			null,
		);

		expect(html).toContain(
			'<h2>What <span class="section-mark">✓ section</span></h2>',
		);
		expect(html).toContain(
			'<h2>Why <span class="section-mark">✓ section</span></h2>',
		);
		expect(html).toContain(
			'<h2>How <span class="section-mark optional">optional</span></h2>',
		);
	});

	it("marks an empty required section as missing", () => {
		const html = renderDescriptionMarkdown("## What\nA.\n\n## Why\n", null);

		expect(html).toContain('<span class="section-mark missing">✕ empty</span>');
	});

	it("leaves other headings unmarked", () => {
		expect(
			renderDescriptionMarkdown("## Notes\nx\n\n### What\ny", null),
		).not.toContain("section-mark");
	});

	it("highlights the first plain-text issue reference", () => {
		const html = renderDescriptionMarkdown("Fixes #12 and #12 again.", "#12");

		expect(html).toBe(
			'<p>Fixes <span class="issue-ref">#12</span> and #12 again.</p>\n',
		);
	});

	it("highlights an issue URL rendered as a link", () => {
		const url = "https://github.com/org/repo/issues/9";
		const html = renderDescriptionMarkdown(`Resolves ${url}.`, url);

		expect(html).toContain(`<a class="issue-ref" href="${url}">${url}</a>`);
	});

	it("escapes raw HTML in the body", () => {
		expect(renderDescriptionMarkdown("<script>x</script>", null)).toContain(
			"&lt;script&gt;",
		);
	});
});
