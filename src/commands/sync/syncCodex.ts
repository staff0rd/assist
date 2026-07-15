import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses, isHarnessAvailable } from "../../shared/harnesses";
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

	const codex = harnesses.codex;

	const commandsSource = path.join(claudeDir, "commands");
	const files = fs.readdirSync(commandsSource);
	for (const file of files) {
		if (!file.endsWith(".md")) continue;
		const name = file.replace(/\.md$/, "");
		const content = fs.readFileSync(path.join(commandsSource, file), "utf8");
		const target = path.join(codex.homeDir, codex.sync.commandDest(name));
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, commandToSkill(name, content));
	}

	const agentsTarget = path.join(codex.homeDir, codex.sync.agentsFile);
	fs.mkdirSync(path.dirname(agentsTarget), { recursive: true });
	fs.copyFileSync(path.join(claudeDir, "CLAUDE.md"), agentsTarget);

	syncCodexHooks(path.join(claudeDir, "..", "codex", "config.toml"));

	console.log(
		`Synced ${files.length} skill(s) to ~/.codex/skills and CLAUDE.md to ~/.codex/AGENTS.md`,
	);
}
