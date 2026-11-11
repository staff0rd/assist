import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { InventoryItem } from "./InventoryItem";

function frontmatterDescription(text: string): string {
	return text.match(/^---\n[\s\S]*?^description:\s*(.+)$/m)?.[1]?.trim() ?? "";
}

function markdownItems(dir: string, prefix: string): InventoryItem[] {
	const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
		a.name.localeCompare(b.name),
	);
	return entries.flatMap((entry) => {
		const file = entry.isDirectory()
			? join(dir, entry.name, "SKILL.md")
			: join(dir, entry.name);
		if (!file.endsWith(".md") || !existsSync(file)) return [];
		const name = entry.isDirectory() ? entry.name : basename(entry.name, ".md");
		return [
			{
				id: `${prefix}:${name}`,
				description: frontmatterDescription(readFileSync(file, "utf8")),
			},
		];
	});
}

export function collectAgentCommands(agentDir: string): InventoryItem[] {
	return [
		...markdownItems(join(agentDir, "commands"), "claude"),
		...markdownItems(join(agentDir, "skills"), "skill"),
	];
}
