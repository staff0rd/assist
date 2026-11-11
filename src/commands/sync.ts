import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../shared/loadConfig";
import { createSyncFiles } from "./sync/createSyncFiles";
import { pruneCommands } from "./sync/pruneCommands";
import { pruneSkills } from "./sync/pruneSkills";
import type { PruneOptions } from "./sync/pruneTarget";
import { reportPrune } from "./sync/reportPrune";
import { syncClaudeCommands } from "./sync/syncClaudeCommands";
import { reportRetiredAgentsFiles } from "./sync/reportRetiredAgentsFiles";
import { syncCodex } from "./sync/syncCodex";
import { syncDesign } from "./sync/syncDesign";
import { syncPi } from "./sync/syncPi";
import { syncSettings } from "./sync/syncSettings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function sync(
	options?: PruneOptions & { yes?: boolean },
): Promise<void> {
	const config = loadConfig();
	const yes = options?.yes ?? config.sync.autoConfirm;
	const prune = { prune: options?.prune, force: options?.force };

	const claudeDir = path.join(__dirname, "..", "claude");
	const targetBase = path.join(os.homedir(), ".claude");

	const files = createSyncFiles();
	const commandNames = syncClaudeCommands(claudeDir, targetBase, files);
	const skillDirNames = syncDesign(claudeDir, targetBase, files);
	await syncSettings(claudeDir, targetBase, {
		yes,
		preferences: config.sync.preferences,
	});
	await syncCodex(claudeDir, files, prune);
	syncPi(claudeDir, files, prune);
	reportRetiredAgentsFiles();

	if (options?.prune) {
		const force = options.force ?? false;
		reportPrune(
			"~/.claude/skills",
			pruneSkills(
				path.join(targetBase, "skills"),
				[...commandNames, ...skillDirNames],
				{ force, owner: files },
			),
			force,
		);
		reportPrune(
			"~/.claude/commands",
			pruneCommands(path.join(targetBase, "commands"), [], {
				force,
				owner: files,
			}),
			force,
		);
	}

	await files.finish(yes);
}
