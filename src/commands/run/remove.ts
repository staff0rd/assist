import { existsSync, readdirSync, rmdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { removeRepoRunConfig } from "./removeRepoRunConfig";
import { runCommandFilePath } from "./runCommandFilePath";

type RemoveOptions = { repo?: string | boolean };

function removeEmptyNamespaceDirs(filePath: string): void {
	const root = join(".claude", "commands");
	for (let dir = dirname(filePath); dir !== root; dir = dirname(dir)) {
		if (!existsSync(dir) || readdirSync(dir).length > 0) return;
		rmdirSync(dir);
	}
}

function deleteCommandFile(name: string): void {
	const filePath = runCommandFilePath(name);
	const legacyPath = join(".claude", "commands", `${name}.md`);
	for (const path of new Set([filePath, legacyPath])) {
		if (existsSync(path)) {
			unlinkSync(path);
			console.log(`Deleted command file: ${path}`);
		}
	}
	removeEmptyNamespaceDirs(filePath);
}

function removeProjectRunConfig(name: string): void {
	const config = loadProjectConfig();
	const runList = config.run as { name: string }[] | undefined;

	if (!runList || !runList.find((r) => r.name === name)) {
		console.error(`Run configuration "${name}" not found`);
		process.exit(1);
	}

	config.run = runList.filter((r) => r.name !== name);
	saveConfig(config);
	deleteCommandFile(name);
}

export async function remove(
	name: string,
	options: RemoveOptions = {},
): Promise<void> {
	if (options.repo !== undefined) {
		const label = await removeRepoRunConfig(
			name,
			typeof options.repo === "string" ? options.repo : undefined,
		);
		console.log(`Removed run configuration: ${name} (repo: ${label})`);
		return;
	}
	removeProjectRunConfig(name);
	console.log(`Removed run configuration: ${name}`);
}
