import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadConfig, saveConfig } from "../../shared/loadConfig";

function findAddIndex(): number {
	const addIndex = process.argv.indexOf("add");
	if (addIndex === -1 || addIndex + 2 >= process.argv.length) return -1;
	return addIndex;
}

function extractAddArgs(addIndex: number) {
	return {
		name: process.argv[addIndex + 1],
		command: process.argv[addIndex + 2],
		args: process.argv.slice(addIndex + 3),
	};
}

function parseAddArguments() {
	const addIndex = findAddIndex();
	return addIndex === -1 ? null : extractAddArgs(addIndex);
}

function buildRunEntry(name: string, command: string, args: string[]) {
	const entry: { name: string; command: string; args?: string[] } = {
		name,
		command,
	};
	if (args.length > 0) entry.args = args;
	return entry;
}

function ensureNoDuplicate(configs: { name: string }[], name: string): void {
	if (configs.find((r) => r.name === name)) {
		console.error(`Run configuration with name "${name}" already exists`);
		process.exit(1);
	}
}

function formatDisplay(command: string, args: string[]): string {
	return args.length > 0 ? `${command} ${args.join(" ")}` : command;
}

function requireParsedArgs() {
	const parsed = parseAddArguments();
	if (!parsed) {
		console.error("Usage: assist run add <name> <command> [args...]");
		process.exit(1);
	}
	return parsed;
}

function getOrInitRunList() {
	const config = loadConfig();
	if (!config.run) config.run = [];
	return { config, runList: config.run };
}

function saveNewRunConfig(name: string, command: string, args: string[]): void {
	const { config, runList } = getOrInitRunList();
	ensureNoDuplicate(runList, name);
	runList.push(buildRunEntry(name, command, args));
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

export function add(): void {
	const { name, command, args } = requireParsedArgs();
	saveNewRunConfig(name, command, args);
	createCommandFile(name);
	console.log(
		`Added run configuration: ${name} -> ${formatDisplay(command, args)}`,
	);
}
