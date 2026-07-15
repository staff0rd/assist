import * as fs from "node:fs";
import * as path from "node:path";
import type { Harness } from "../../shared/harnesses";

export function installHarnessCommands(
	claudeDir: string,
	harness: Harness,
	transform: (name: string, content: string) => string,
): { total: number; synced: number } {
	const commandsSource = path.join(claudeDir, "commands");
	const files = fs.readdirSync(commandsSource);
	let synced = 0;
	for (const file of files) {
		if (!file.endsWith(".md")) continue;
		const name = file.replace(/\.md$/, "");
		const content = fs.readFileSync(path.join(commandsSource, file), "utf8");
		const target = path.join(harness.homeDir, harness.sync.commandDest(name));
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, transform(name, content));
		synced++;
	}

	const agentsTarget = path.join(harness.homeDir, harness.sync.agentsFile);
	fs.mkdirSync(path.dirname(agentsTarget), { recursive: true });
	fs.copyFileSync(path.join(claudeDir, "CLAUDE.md"), agentsTarget);

	return { total: files.length, synced };
}
