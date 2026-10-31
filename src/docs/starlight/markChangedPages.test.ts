import { describe, expect, it } from "vitest";
import { markChangedPages } from "./markChangedPages";

function link(label: string, href: string) {
	return { type: "link" as const, label, href, attrs: {} };
}

describe("markChangedPages", () => {
	it("marks changed sidebar links and lists them in sidebar order", () => {
		const updating = link("Updating", "/assist/updating/");
		const backlog = link("Backlog", "/assist/backlog/");
		const config = link("Config", "/assist/config/");
		const pages = markChangedPages(
			[{ type: "group", entries: [updating, backlog] }, config],
			["config", "updating"],
			"/assist",
		);
		expect(pages).toEqual([
			{ id: "updating", href: "/assist/updating/", label: "Updating" },
			{ id: "config", href: "/assist/config/", label: "Config" },
		]);
		expect(updating.attrs).toEqual({ "data-assist-changed": "" });
		expect(backlog.attrs).toEqual({});
	});

	it("links changed pages missing from the sidebar by id", () => {
		expect(markChangedPages([], ["index", "draft"], "/")).toEqual([
			{ id: "index", href: "/", label: "index" },
			{ id: "draft", href: "/draft/", label: "draft" },
		]);
	});

	it("lists nothing without changes", () => {
		const updating = link("Updating", "/updating/");
		expect(markChangedPages([updating], [], "/")).toEqual([]);
		expect(updating.attrs).toEqual({});
	});
});
