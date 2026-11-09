import * as path from "node:path";
import { stringify } from "yaml";
import { harnesses, isHarnessAvailable } from "../../shared/harnesses";
import { installDesignResources } from "./installDesignResources";
import { installHarnessCommands } from "./installHarnessCommands";
import { pruneCommands } from "./pruneCommands";
import type { PruneOptions } from "./pruneTarget";
import { reportPrune } from "./reportPrune";
import { splitFrontmatter } from "./splitFrontmatter";
import { syncPiHooks } from "./syncPiHooks";

function unquote(value: string): string {
	return value.trim().replace(/^["']|["']$/g, "");
}

export function commandToPrompt(name: string, content: string): string {
	const split = splitFrontmatter(content);
	const { frontmatter, body } = split;
	const description = split.description ?? name;
	const argsMatch = frontmatter.match(/^allowed_args:\s*(.*)$/m);
	const argumentHint = argsMatch ? unquote(argsMatch[1]) : undefined;

	const frontmatterYaml = stringify(
		argumentHint
			? { description, "argument-hint": argumentHint }
			: { description },
		{ lineWidth: 0 },
	);
	return `---\n${frontmatterYaml}---\n\n${body.replace(/^\r?\n+/, "")}`;
}

export function syncPi(claudeDir: string, options?: PruneOptions): void {
	if (!isHarnessAvailable("pi")) return;

	const { synced, names } = installHarnessCommands(
		claudeDir,
		harnesses.pi,
		commandToPrompt,
	);

	const designSkills = installDesignResources(claudeDir, harnesses.pi);

	syncPiHooks(path.join(claudeDir, "..", "pi"));

	console.log(`Synced ${synced} prompt(s) to ~/.pi/agent/prompts`);
	console.log(
		`Synced the design system prompt and ${designSkills.length} design skill(s) to ~/.pi/agent/assist`,
	);

	if (!options?.prune) return;

	const force = options.force ?? false;

	reportPrune(
		"~/.pi/agent/prompts",
		pruneCommands(path.join(harnesses.pi.homeDir, "prompts"), names, { force }),
		force,
	);
}
