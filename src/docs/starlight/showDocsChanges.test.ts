// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showDocsChanges } from "./showDocsChanges";

const pages = [
	{ id: "updating", href: "/updating/", label: "Updating" },
	{ id: "config", href: "/config/", label: "Config" },
];

function render(pageId: string, body: string, changed = pages) {
	document.head.innerHTML = `
		<meta name="assist-docs-page" content="${pageId}">
		${changed.length ? `<meta name="assist-docs-changes" content='${JSON.stringify(changed)}'>` : ""}`;
	document.body.innerHTML = `<div class="sl-markdown-content">${body}</div>`;
	showDocsChanges(document);
	return document.querySelector(".assist-diff-nav");
}

function click(label: string) {
	document
		.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
		?.click();
}

beforeEach(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	document.head.replaceChildren();
	document.body.replaceChildren();
});

describe("showDocsChanges", () => {
	const body = `
		<p class="assist-diff-removed">old</p>
		<p class="assist-diff-added">new</p>
		<p>same</p>
		<ul class="assist-diff-added"><li class="assist-diff-added">x</li></ul>`;

	it("counts adjacent highlights as one change and nested ones not at all", () => {
		expect(render("updating", body)?.textContent).toContain("2 changes");
	});

	it("steps through changes, wrapping at either end", () => {
		const bar = render("updating", body);
		click("Next change");
		expect(bar?.textContent).toContain("change 1 of 2");
		expect(
			[...document.querySelectorAll(".assist-diff-focus")].map(
				(element) => element.textContent,
			),
		).toEqual(["old", "new"]);
		click("Next change");
		click("Next change");
		expect(bar?.textContent).toContain("change 1 of 2");
		click("Previous change");
		expect(bar?.textContent).toContain("change 2 of 2");
		expect(document.querySelectorAll(".assist-diff-focus")).toHaveLength(1);
	});

	it("links the other changed pages", () => {
		const links = render("updating", body)?.querySelectorAll("a");
		expect([...(links ?? [])].map((link) => link.getAttribute("href"))).toEqual(
			["/config/"],
		);
	});

	it("shows no bar on an unchanged page or without changes", () => {
		expect(render("backlog", body)).toBeNull();
		expect(render("updating", body, [])).toBeNull();
	});
});
