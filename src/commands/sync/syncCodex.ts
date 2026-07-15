import * as path from "node:path";
import { harnesses, isHarnessAvailable } from "../../shared/harnesses";
import { installHarnessCommands } from "./installHarnessCommands";
import { syncCodexHooks } from "./syncCodexHooks";

function quoteYaml(value: string): string {
	return `"${value.replace(/\\/g, String.raw`\\`).replace(/"/g, String.raw`\"`)}"`;
}

export function commandToSkill(name: string, content: string): string {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	const frontmatter = match ? match[1] : "";
	const body = match ? content.slice(match[0].length) : content;
	const descriptionMatch = frontmatter.match(/^description:\s*(.*)$/m);
	const description = descriptionMatch
		? descriptionMatch[1].trim().replace(/^["']|["']$/g, "")
		: name;
	const header = `---\nname: ${name}\ndescription: ${quoteYaml(description)}\n---\n\n`;
	return header + body.replace(/^\r?\n+/, "");
}

export function syncCodex(claudeDir: string): void {
	if (!isHarnessAvailable("codex")) return;

	const { total } = installHarnessCommands(
		claudeDir,
		harnesses.codex,
		commandToSkill,
	);

	syncCodexHooks(path.join(claudeDir, "..", "codex", "config.toml"));

	console.log(
		`Synced ${total} skill(s) to ~/.codex/skills and CLAUDE.md to ~/.codex/AGENTS.md`,
	);
}
