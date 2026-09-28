import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../shared/loadConfig";
import { pruneCommands } from "./sync/pruneCommands";
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

	const commandFiles = syncClaudeCommands(claudeDir, targetBase);
	syncDesign(claudeDir, targetBase);
	await syncSettings(claudeDir, targetBase, { yes });
	syncCodex(claudeDir, prune);
	syncPi(claudeDir, prune);
	reportRetiredAgentsFiles();

	if (!options?.prune) return;

	const commandNames = commandFiles
		.filter((file) => file.endsWith(".md"))
		.map((file) => path.basename(file, ".md"));
	const force = options.force ?? false;

	reportPrune(
		"~/.claude/commands",
		pruneCommands(path.join(targetBase, "commands"), commandNames, { force }),
		force,
	);
}
