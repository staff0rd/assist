import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../shared/loadConfig";
import { createSyncFiles } from "./sync/createSyncFiles";
import { pruneClaude } from "./sync/pruneClaude";
import type { PruneOptions } from "./sync/pruneTarget";
import { syncClaudeCommands } from "./sync/syncClaudeCommands";
import { reportRetiredAgentsFiles } from "./sync/reportRetiredAgentsFiles";
import { retiredOwnedPaths } from "./sync/retiredOwnedPaths";
import { syncCodex } from "./sync/syncCodex";
import { syncDesign } from "./sync/syncDesign";
import { syncPi } from "./sync/syncPi";
import { syncManifest } from "./sync/syncManifest";
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

	const files = createSyncFiles([
		...syncManifest.load(),
		...retiredOwnedPaths(),
	]);
	const commandNames = syncClaudeCommands(claudeDir, targetBase, files);
	const designSkillNames = syncDesign(claudeDir, targetBase, files);
	await syncSettings(claudeDir, targetBase, {
		yes,
		preferences: config.sync.preferences,
	});
	await syncCodex(claudeDir, files, prune);
	syncPi(claudeDir, files, prune);
	reportRetiredAgentsFiles();

	pruneClaude(targetBase, [...commandNames, ...designSkillNames], prune, files);

	await files.finish(yes);
}
