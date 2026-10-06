import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { removeRepoRunConfig } from "./removeRepoRunConfig";

type RemoveOptions = { repo?: string | boolean };

function deleteCommandFile(name: string): void {
	const filePath = join(".claude", "commands", `${name}.md`);
	if (existsSync(filePath)) {
		unlinkSync(filePath);
		console.log(`Deleted command file: ${filePath}`);
	}
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
