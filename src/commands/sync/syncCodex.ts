import * as path from "node:path";
import { harnesses, isHarnessAvailable } from "../../shared/harnesses";
import { installDesignResources } from "./installDesignResources";
import { installHarnessCommands } from "./installHarnessCommands";
import { pruneSkills } from "./pruneSkills";
import type { PruneOptions } from "./pruneTarget";
import { reportPrune } from "./reportPrune";
import { syncCodexHooks } from "./syncCodexHooks";
import { commandToSkill } from "./commandToSkill";
import type { SyncFiles } from "./createSyncFiles";

export async function syncCodex(
	claudeDir: string,
	files: SyncFiles,
	options?: PruneOptions,
): Promise<void> {
	if (!isHarnessAvailable("codex")) return;

	const { total, names } = installHarnessCommands(
		claudeDir,
		harnesses.codex,
		commandToSkill,
		files,
	);

	const designSkills = installDesignResources(
		claudeDir,
		harnesses.codex,
		files,
	);

	await syncCodexHooks(path.join(claudeDir, "..", "codex", "config.toml"));

	console.log(`Synced ${total} skill(s) to ~/.codex/skills`);
	console.log(
		`Synced the design system prompt and ${designSkills.length} design skill(s) for Codex`,
	);

	if (!options?.prune) return;

	const force = options.force ?? false;

	reportPrune(
		"~/.codex/skills",
		pruneSkills(
			path.join(harnesses.codex.homeDir, "skills"),
			[...names, ...designSkills],
			{ force, owner: files },
		),
		force,
	);
}
