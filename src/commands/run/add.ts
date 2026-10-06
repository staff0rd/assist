import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import type { RunConfig } from "../../shared/types";
import { addRepoRunConfig } from "./addRepoRunConfig";
import { buildRunEntry } from "./buildRunEntry";
import { ensureNoDuplicateRun } from "./ensureNoDuplicateRun";
import { requireParsedArgs } from "./requireParsedArgs";

function formatDisplay(command: string, args: string[]): string {
	return args.length > 0 ? `${command} ${args.join(" ")}` : command;
}

function saveProjectRunConfig(entry: RunConfig): void {
	const config = loadProjectConfig();
	if (!config.run) config.run = [];
	const runList = config.run as object[];
	ensureNoDuplicateRun(runList, entry.name);
	runList.push(entry);
	saveConfig(config);
}

function createCommandFile(name: string): void {
	const dir = join(".claude", "commands");
	mkdirSync(dir, { recursive: true });
	const content = `---\ndescription: Run ${name}\n---\n\nRun \`assist run ${name} $ARGUMENTS 2>&1\`.\n`;
	const filePath = join(dir, `${name}.md`);
	writeFileSync(filePath, content);
	console.log(`Created command file: ${filePath}`);
}

export async function add(): Promise<void> {
	const { name, command, args, options, repo } = requireParsedArgs();
	const entry = buildRunEntry(name, command, args, options);
	const display = formatDisplay(command, args);
	if (repo !== undefined) {
		const label = await addRepoRunConfig(
			entry,
			typeof repo === "string" ? repo : undefined,
		);
		console.log(
			`Added run configuration: ${name} -> ${display} (repo: ${label})`,
		);
		return;
	}
	saveProjectRunConfig(entry);
	if (!name.startsWith("verify:")) {
		createCommandFile(name);
	}
	console.log(`Added run configuration: ${name} -> ${display}`);
}
