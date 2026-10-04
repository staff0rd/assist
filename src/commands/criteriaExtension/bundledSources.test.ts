import { describe, expect, it } from "vitest";
import { bundledSources } from "./bundledSources";

describe("bundledSources", () => {
	it("lists the shared outliner components the content script bundles, without node_modules", async () => {
		const sources = await bundledSources(
			"src/commands/criteriaExtension/criteriaContentScript.ts",
		);
		expect(sources).toContain(
			"src/commands/sessions/web/ui/AcceptanceCriteriaOutline.tsx",
		);
		expect(sources.some((s) => s.startsWith("node_modules/"))).toBe(false);
	});
});
