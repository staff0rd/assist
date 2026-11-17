// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { readDocsSelection } from "./readDocsSelection";

const PAGE = `
<main>
	<h1 id="title">Getting started</h1>
	<p id="intro">Install assist to begin.</p>
</main>
<section data-docs-heading="Install" data-docs-source="docs/guide/pages/start.json">
	<h2>Install</h2><p id="text">Run npm install to begin.</p>
</section>
<p id="outside">Not in a section</p>`;

const PAGE_META = [
	'<meta name="assist-docs-page" content="start">',
	'<meta name="assist-docs-title" content="Getting started">',
	'<meta name="assist-docs-source" content="docs/src/content/docs/start.md">',
].join("");

function render(meta = true, extraMeta = "") {
	document.head.innerHTML = meta ? PAGE_META + extraMeta : "";
	document.body.innerHTML = PAGE;
}

function select(id: string, start: number, end: number): Selection {
	const text = document.getElementById(id)?.firstChild as Text;
	const range = document.createRange();
	range.setStart(text, start);
	range.setEnd(text, end);
	const selection = globalThis.getSelection() as Selection;
	selection.removeAllRanges();
	selection.addRange(range);
	return selection;
}

afterEach(() => {
	document.head.innerHTML = "";
	document.body.innerHTML = "";
});

describe("readDocsSelection", () => {
	it("reads the page, section and selected text", () => {
		render();
		expect(readDocsSelection(document, select("text", 4, 15))).toMatchObject({
			pageId: "start",
			heading: "Install",
			source: "docs/guide/pages/start.json",
			selection: "npm install",
		});
	});

	it("reads the node serving the preview when the page names one", () => {
		render();
		expect(
			readDocsSelection(document, select("text", 4, 15)),
		).not.toHaveProperty("node");
		render(true, '<meta name="assist-docs-node" content="mac">');
		expect(readDocsSelection(document, select("text", 4, 15))).toMatchObject({
			node: "mac",
		});
	});

	it("ignores pages that are not a docs preview", () => {
		render(false);
		expect(readDocsSelection(document, select("text", 4, 15))).toBeUndefined();
	});

	it("ignores a collapsed or blank selection", () => {
		render();
		expect(readDocsSelection(document, select("text", 4, 4))).toBeUndefined();
		expect(readDocsSelection(document, select("text", 3, 4))).toBeUndefined();
	});

	it("reads the page title and intro as the page's own section", () => {
		render();
		const expected = {
			pageId: "start",
			heading: "Getting started",
			source: "docs/src/content/docs/start.md",
		};
		expect(readDocsSelection(document, select("title", 0, 7))).toMatchObject({
			...expected,
			selection: "Getting",
		});
		expect(readDocsSelection(document, select("intro", 0, 7))).toMatchObject({
			...expected,
			selection: "Install",
		});
	});

	it("ignores text outside a docs section", () => {
		render();
		expect(
			readDocsSelection(document, select("outside", 0, 3)),
		).toBeUndefined();
	});
});
