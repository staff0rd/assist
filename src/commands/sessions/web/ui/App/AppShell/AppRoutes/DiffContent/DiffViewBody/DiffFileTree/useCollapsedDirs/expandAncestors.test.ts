import { describe, expect, it } from "vitest";
import { expandAncestors } from "./expandAncestors";

describe("expandAncestors", () => {
	it("expands every collapsed directory above the file", () => {
		const collapsed = new Set(["src", "src/web/ui", "docs"]);

		expect([...expandAncestors(collapsed, "src/web/ui/App.tsx")]).toEqual([
			"docs",
		]);
	});

	it("keeps the same set when no ancestor is collapsed", () => {
		const collapsed = new Set(["docs"]);

		expect(expandAncestors(collapsed, "src/app.ts")).toBe(collapsed);
	});

	it("does not treat a directory sharing a name prefix as an ancestor", () => {
		const collapsed = new Set(["src/web"]);

		expect(expandAncestors(collapsed, "src/website/app.ts")).toBe(collapsed);
	});
});
