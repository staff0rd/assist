import * as fs from "node:fs";
import * as path from "node:path";
import type { Harness } from "../../shared/harnesses";
import type { SyncFiles } from "./createSyncFiles";
import { renderHarnessPaths } from "./renderHarnessPaths";

export function installHarnessCommands(
	claudeDir: string,
	harness: Harness,
	transform: (name: string, content: string) => string,
	files: SyncFiles,
): { total: number; synced: number; names: string[] } {
	const commandsSource = path.join(claudeDir, "commands");
	const sourceFiles = fs.readdirSync(commandsSource);
	const names: string[] = [];
	for (const file of sourceFiles) {
		if (!file.endsWith(".md")) continue;
		const name = file.replace(/\.md$/, "");
		names.push(name);
		const content = fs.readFileSync(path.join(commandsSource, file), "utf8");
		files.write(
			path.join(harness.homeDir, harness.sync.commandDest(name)),
			transform(name, renderHarnessPaths(content, harness)),
		);
	}

	return { total: sourceFiles.length, synced: names.length, names };
}
