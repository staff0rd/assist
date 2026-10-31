import { describe, expect, it } from "vitest";
import { previewPageMeta } from "./previewPageMeta";

describe("previewPageMeta", () => {
	it("names the page, its title and its source in the metas the extension looks for", () => {
		expect(
			previewPageMeta({
				id: "updating",
				title: "Updating",
				source: "docs/src/content/docs/updating.md",
			}),
		).toEqual([
			{
				tag: "meta",
				attrs: { name: "assist-docs-page", content: "updating" },
				content: "",
			},
			{
				tag: "meta",
				attrs: { name: "assist-docs-title", content: "Updating" },
				content: "",
			},
			{
				tag: "meta",
				attrs: {
					name: "assist-docs-source",
					content: "docs/src/content/docs/updating.md",
				},
				content: "",
			},
		]);
	});

	it("lists the changed pages in a meta only when there are some", () => {
		const page = { id: "a", title: "A", source: "docs/a.md" };
		const changedPages = [{ id: "a", href: "/a/", label: "A" }];
		expect(previewPageMeta({ ...page, changedPages }).at(-1)).toEqual({
			tag: "meta",
			attrs: {
				name: "assist-docs-changes",
				content: JSON.stringify(changedPages),
			},
			content: "",
		});
		expect(previewPageMeta({ ...page, changedPages: [] })).toHaveLength(3);
	});
});
