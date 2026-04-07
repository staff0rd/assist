import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";

function findRemoveIndex(): number {
	const idx = process.argv.indexOf("remove");
	if (idx === -1 || idx + 1 >= process.argv.length) return -1;
	return idx;
}

function parseRemoveName(): string {
	const idx = findRemoveIndex();
	if (idx === -1) {
		console.error("Usage: assist run remove <name>");
		process.exit(1);
	}
	return process.argv[idx + 1];
}

function deleteCommandFile(name: string): void {
	const filePath = join(".claude", "commands", `${name}.md`);
	if (existsSync(filePath)) {
		unlinkSync(filePath);
		console.log(`Deleted command file: ${filePath}`);
	}
}

export function remove(): void {
	const name = parseRemoveName();
	const config = loadProjectConfig();
	const runList = config.run as { name: string }[] | undefined;

	if (!runList || !runList.find((r) => r.name === name)) {
		console.error(`Run configuration "${name}" not found`);
		process.exit(1);
	}

	config.run = runList.filter((r) => r.name !== name);
	saveConfig(config);
	deleteCommandFile(name);
	console.log(`Removed run configuration: ${name}`);
}
