import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../shared/loadConfig";
import { pruneCommands } from "./sync/pruneCommands";
import type { PruneOptions } from "./sync/pruneTarget";
import { reportPrune } from "./sync/reportPrune";
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

	const commandFiles = syncCommands(claudeDir, targetBase);
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

function syncCommands(claudeDir: string, targetBase: string): string[] {
	const sourceDir = path.join(claudeDir, "commands");
	const targetDir = path.join(targetBase, "commands");

	fs.mkdirSync(targetDir, { recursive: true });

	const files = fs.readdirSync(sourceDir);
	for (const file of files) {
		fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
		console.log(`Copied ${file} to ${targetDir}`);
	}

	console.log(`Synced ${files.length} command(s) to ~/.claude/commands`);

	return files;
}
