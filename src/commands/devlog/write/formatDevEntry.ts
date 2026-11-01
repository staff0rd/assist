import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { DevEntryInput } from "./devEntryInputSchema";

function buildFrontmatter(
	project: string,
	entry: DevEntryInput,
): Record<string, unknown> {
	const frontmatter: Record<string, unknown> = {
		project,
		week: entry.week,
		title: entry.title,
	};
	if (entry.versions) frontmatter.versions = entry.versions;
	frontmatter["ai-generated"] = entry.aiGenerated;
	for (const key of ["added", "changed", "fixed"] as const) {
		if (entry[key].length > 0) frontmatter[key] = entry[key];
	}
	return frontmatter;
}

export function formatDevEntry(project: string, entry: DevEntryInput): string {
	const frontmatter = buildFrontmatter(project, entry);
	const yaml = stringifyYaml(frontmatter, {
		lineWidth: 0,
		defaultKeyType: "PLAIN",
		defaultStringType: "QUOTE_DOUBLE",
	});
	if (JSON.stringify(parseYaml(yaml)) !== JSON.stringify(frontmatter)) {
		throw new Error("Generated frontmatter does not round-trip");
	}
	return `---\n${yaml}---\n\n${entry.lede.trim()}\n`;
}
