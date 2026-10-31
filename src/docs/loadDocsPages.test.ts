import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDocsPages } from "./loadDocsPages";

let dir: string;

function page(id: string, extra = "") {
	return `---
id: ${id}
title: ${id}
group: Getting started
order: 0
covers: []
${extra}---

## Intro

Hello
`;
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "docs-pages-"));
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

describe("loadDocsPages", () => {
	it("loads the frontmatter of every markdown page in the directory", () => {
		writeFileSync(join(dir, "b.md"), page("b"));
		writeFileSync(
			join(dir, "a.md"),
			page("a", "screenshots:\n  - file: a.png\n    alt: A\n    route: /a\n"),
		);
		writeFileSync(join(dir, "notes.json"), "{}");
		const pages = loadDocsPages(dir);
		expect(pages.map((p) => p.id)).toEqual(["a", "b"]);
		expect(pages[0].screenshots?.[0].file).toBe("a.png");
	});

	it("loads a splash landing page with no group, order or covers", () => {
		writeFileSync(
			join(dir, "index.md"),
			"---\nid: index\ntitle: assist\ntemplate: splash\nhero:\n  tagline: Hi\n---\n",
		);
		const [landing] = loadDocsPages(dir);
		expect(landing).toMatchObject({ id: "index", covers: [] });
		expect("group" in landing).toBe(false);
	});

	it("names the file when a page has an unknown key", () => {
		writeFileSync(join(dir, "bad.md"), page("bad", "draft: true\n"));
		expect(() => loadDocsPages(dir)).toThrow(/bad\.md/);
	});

	it("names the file when a page has no frontmatter", () => {
		writeFileSync(join(dir, "broken.md"), "## Intro\n");
		expect(() => loadDocsPages(dir)).toThrow(/broken\.md: invalid frontmatter/);
	});

	it("rejects a page whose id does not match its file name", () => {
		writeFileSync(join(dir, "one.md"), page("two"));
		expect(() => loadDocsPages(dir)).toThrow(
			/one\.md: id two does not match file name/,
		);
	});
});
