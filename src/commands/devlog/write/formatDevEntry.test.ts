import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import { devEntryInputSchema } from "./devEntryInputSchema";
import { formatDevEntry } from "./formatDevEntry";

function frontmatterOf(markdown: string): Record<string, unknown> {
	const match = markdown.match(/^---\n([\s\S]*?)\n---/);
	if (!match) throw new Error("no frontmatter");
	return parseYaml(match[1]);
}

const w49 = devEntryInputSchema.parse({
	week: "2025-W49",
	title: "Autocomplete fix: tidier # config saves",
	versions: { first: "v1.0", last: "v1.0" },
	aiGenerated: "claude-opus-5-5",
	fixed: [
		{
			text: "Saving the config no longer writes empty fields as `null` or `url_encode: false`",
			version: "v1.0",
		},
		{ text: "`list` keeps # comments", version: "v1.0" },
	],
	lede: "A short fix-up week.",
});

describe("formatDevEntry", () => {
	it("writes YAML-significant text so it parses back unchanged", () => {
		const markdown = formatDevEntry("project-switch", w49);
		expect(frontmatterOf(markdown)).toEqual({
			project: "project-switch",
			week: "2025-W49",
			title: "Autocomplete fix: tidier # config saves",
			versions: { first: "v1.0", last: "v1.0" },
			"ai-generated": "claude-opus-5-5",
			fixed: w49.fixed,
		});
		expect(markdown).toContain(
			'- text: "Saving the config no longer writes empty fields as `null` or `url_encode: false`"',
		);
	});

	it("omits empty lists and versions, and ends with the lede", () => {
		const markdown = formatDevEntry("assist", {
			...w49,
			versions: undefined,
		});
		const frontmatter = frontmatterOf(markdown);
		expect(frontmatter).not.toHaveProperty("added");
		expect(frontmatter).not.toHaveProperty("versions");
		expect(markdown.endsWith("---\n\nA short fix-up week.\n")).toBe(true);
	});
});

describe("devEntryInputSchema", () => {
	it("rejects an invalid week and multi-line text", () => {
		const result = devEntryInputSchema.safeParse({
			week: "2025-W60",
			title: "a\nb",
			aiGenerated: "m",
			lede: "x",
		});
		expect(result.success).toBe(false);
		expect(result.error?.issues.map((i) => i.path[0])).toEqual([
			"week",
			"title",
		]);
	});
});
