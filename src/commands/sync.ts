import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function sync(): void {
	const sourceDir = path.join(__dirname, "..", "..", "claude", "commands");
	const targetDir = path.join(os.homedir(), ".claude", "commands");

	// Ensure target directory exists
	fs.mkdirSync(targetDir, { recursive: true });

	// Copy all files from commands directory
	const files = fs.readdirSync(sourceDir);
	for (const file of files) {
		const sourcePath = path.join(sourceDir, file);
		const targetPath = path.join(targetDir, file);
		fs.copyFileSync(sourcePath, targetPath);
		console.log(`Copied ${file} to ${targetDir}`);
	}

	console.log(`Synced ${files.length} command(s) to ~/.claude/commands`);
}
