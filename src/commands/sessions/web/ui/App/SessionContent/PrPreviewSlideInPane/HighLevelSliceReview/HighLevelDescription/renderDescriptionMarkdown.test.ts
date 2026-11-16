import { describe, expect, it } from "vitest";
import { descriptionImageSrc } from "./descriptionImageSrc";
import { renderDescriptionMarkdown } from "./renderDescriptionMarkdown";

const resolve = descriptionImageSrc("acme/app", 7);
const asset = "0b6f7c1e-2d3a-4b5c-8d9e-0123456789ab";
const attachment = `https://github.com/user-attachments/assets/${asset}`;
const proxied = `/api/github-attachment?repo=acme%2Fapp&amp;pr=7&amp;asset=${asset}`;

function render(body: string): string {
	return renderDescriptionMarkdown(body, null, resolve);
}

describe("renderDescriptionMarkdown", () => {
	it("marks filled What and Why headings as sections and How as optional", () => {
		const html = renderDescriptionMarkdown(
			"## What\nA.\n\n## Why\nB.\n\n## How\nC.",
			null,
			resolve,
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
		const html = renderDescriptionMarkdown(
			"## What\nA.\n\n## Why\n",
			null,
			resolve,
		);

		expect(html).toContain('<span class="section-mark missing">✕ empty</span>');
	});

	it("leaves other headings unmarked", () => {
		expect(
			renderDescriptionMarkdown("## Notes\nx\n\n### What\ny", null, resolve),
		).not.toContain("section-mark");
	});

	it("highlights the first plain-text issue reference", () => {
		const html = renderDescriptionMarkdown(
			"Fixes #12 and #12 again.",
			"#12",
			resolve,
		);

		expect(html).toBe(
			'<p>Fixes <span class="issue-ref">#12</span> and #12 again.</p>\n',
		);
	});

	it("highlights an issue URL rendered as a link", () => {
		const url = "https://github.com/org/repo/issues/9";
		const html = renderDescriptionMarkdown(`Resolves ${url}.`, url, resolve);

		expect(html).toContain(`<a class="issue-ref" href="${url}">${url}</a>`);
	});

	it("escapes raw HTML in the body", () => {
		expect(
			renderDescriptionMarkdown("<script>x</script>", null, resolve),
		).toContain("&lt;script&gt;");
	});

	it("renders a GitHub attachment <img> through the attachment proxy, keeping its size and alt", () => {
		const html = render(
			`<img width="418" height="829" alt="image" src="${attachment}" />`,
		);

		expect(html).toContain(
			`<img src="${proxied}" alt="image" width="418" height="829">`,
		);
		expect(html).not.toContain("&lt;img");
	});

	it("renders markdown image syntax for an attachment", () => {
		expect(render(`![shot](${attachment})`)).toContain(
			`<img src="${proxied}" alt="shot">`,
		);
	});

	it("keeps other https images as they are", () => {
		expect(render('<img src="https://example.com/a.png">')).toContain(
			'<img src="https://example.com/a.png">',
		);
	});

	it("drops event handlers and other attributes from an <img>", () => {
		const html = render(
			`<img src="${attachment}" onerror="alert(1)" style="x" width="10px">`,
		);

		expect(html).toContain(`<img src="${proxied}">`);
		expect(html).not.toContain("onerror");
	});

	it.each([
		["a javascript: src", '<img src="javascript:alert(1)">'],
		["an http src", '<img src="http://example.com/a.png">'],
		["a data: src", '<img src="data:image/png;base64,AAAA">'],
		["no src", '<img alt="x">'],
	])("escapes an <img> with %s", (_label, tag) => {
		const html = render(tag);

		expect(html).toContain("&lt;img");
		expect(html).not.toContain("<img");
	});

	it("drops a markdown image with a javascript: src", () => {
		expect(render("![x](javascript:alert(1))")).not.toContain("<img");
	});

	it("escapes the HTML around an allowed <img>", () => {
		const html = render(
			`<div onclick="x"><img src="${attachment}"><script>x</script></div>`,
		);

		expect(html).toContain("&lt;div onclick=&quot;x&quot;&gt;");
		expect(html).toContain("&lt;script&gt;");
		expect(html).toContain(`<img src="${proxied}">`);
	});
});
