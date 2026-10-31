// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showDocsChanges } from "./showDocsChanges";

const pages = [
	{ id: "updating", href: "/updating/", label: "Updating" },
	{ id: "config", href: "/config/", label: "Config" },
	{ id: "backlog", href: "/backlog/", label: "Backlog" },
];

const go = vi.fn();

function render(pageId: string, body: string, changed = pages, hash = "") {
	history.replaceState(null, "", `/${hash}`);
	document.head.innerHTML = `
		<meta name="assist-docs-page" content="${pageId}">
		${changed.length ? `<meta name="assist-docs-changes" content='${JSON.stringify(changed)}'>` : ""}`;
	document.body.innerHTML = `<div class="sl-markdown-content">${body}</div>`;
	showDocsChanges(document, go);
	return document.querySelector(".assist-diff-nav");
}

function click(label: string) {
	document
		.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
		?.click();
}

function focused() {
	return [...document.querySelectorAll(".assist-diff-focus")].map(
		(element) => element.textContent,
	);
}

beforeEach(() => {
	Element.prototype.scrollIntoView = vi.fn();
	go.mockReset();
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
		expect(render("config", body)?.textContent).toContain("2 changes");
	});

	it("steps through the page's changes", () => {
		const bar = render("config", body);
		click("Next change");
		expect(bar?.textContent).toContain("change 1 of 2");
		expect(focused()).toEqual(["old", "new"]);
		click("Next change");
		expect(bar?.textContent).toContain("change 2 of 2");
		click("Previous change");
		expect(bar?.textContent).toContain("change 1 of 2");
		expect(go).not.toHaveBeenCalled();
	});

	it("steps past either end onto the neighbouring changed page", () => {
		render("config", body);
		click("Previous change");
		expect(go).toHaveBeenLastCalledWith("/updating/#assist-change-last");
		click("Next change");
		click("Next change");
		click("Next change");
		expect(go).toHaveBeenLastCalledWith("/backlog/#assist-change-first");
	});

	it("wraps from the last changed page to the first", () => {
		render("backlog", body);
		click("Next change");
		click("Next change");
		click("Next change");
		expect(go).toHaveBeenLastCalledWith("/updating/#assist-change-first");
	});

	it("opens on the first or last change when arriving from another page", () => {
		const bar = render("config", body, pages, "#assist-change-last");
		expect(bar?.textContent).toContain("change 2 of 2");
		render("config", body, pages, "#assist-change-first");
		expect(focused()).toEqual(["old", "new"]);
	});

	it("wraps within the page when it is the only changed page", () => {
		const bar = render("config", body, [pages[1]]);
		click("Previous change");
		expect(bar?.textContent).toContain("change 2 of 2");
		expect(bar?.querySelector("details")).toBeNull();
	});

	it("links the other changed pages", () => {
		const links = render("updating", body)?.querySelectorAll("a");
		expect([...(links ?? [])].map((link) => link.getAttribute("href"))).toEqual(
			["/config/", "/backlog/"],
		);
	});

	it("shows no bar on an unchanged page or without changes", () => {
		expect(render("cli-git", body)).toBeNull();
		expect(render("updating", body, [])).toBeNull();
	});
});
