import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { syncSettings } from "./sync/syncSettings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function sync(): Promise<void> {
	const claudeDir = path.join(__dirname, "..", "claude");
	const targetBase = path.join(os.homedir(), ".claude");

	syncCommands(claudeDir, targetBase);
	await syncSettings(claudeDir, targetBase);
}

function syncCommands(claudeDir: string, targetBase: string): void {
	const sourceDir = path.join(claudeDir, "commands");
	const targetDir = path.join(targetBase, "commands");

	fs.mkdirSync(targetDir, { recursive: true });

	const files = fs.readdirSync(sourceDir);
	for (const file of files) {
		fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
		console.log(`Copied ${file} to ${targetDir}`);
	}

	console.log(`Synced ${files.length} command(s) to ~/.claude/commands`);
}
