import * as path from "node:path";
import { harnesses, isHarnessAvailable } from "../../shared/harnesses";
import { installHarnessCommands } from "./installHarnessCommands";
import { syncPiHooks } from "./syncPiHooks";

function unquote(value: string): string {
	return value.trim().replace(/^["']|["']$/g, "");
}

export function commandToPrompt(name: string, content: string): string {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	const frontmatter = match ? match[1] : "";
	const body = match ? content.slice(match[0].length) : content;

	const descriptionMatch = frontmatter.match(/^description:\s*(.*)$/m);
	const description = descriptionMatch ? unquote(descriptionMatch[1]) : name;
	const argsMatch = frontmatter.match(/^allowed_args:\s*(.*)$/m);
	const argumentHint = argsMatch ? unquote(argsMatch[1]) : undefined;

	const header = [
		"---",
		`description: ${description}`,
		...(argumentHint ? [`argument-hint: ${argumentHint}`] : []),
		"---",
		"",
		"",
	].join("\n");
	return header + body.replace(/^\r?\n+/, "");
}

export function syncPi(claudeDir: string): void {
	if (!isHarnessAvailable("pi")) return;

	const { synced } = installHarnessCommands(
		claudeDir,
		harnesses.pi,
		commandToPrompt,
	);

	syncPiHooks(path.join(claudeDir, "..", "pi"));

	console.log(
		`Synced ${synced} prompt(s) to ~/.pi/agent/prompts and CLAUDE.md to ~/.pi/agent/AGENTS.md`,
	);
}
