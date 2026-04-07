import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { buildRunEntry } from "./buildRunEntry";

function findAddIndex(): number {
	const addIndex = process.argv.indexOf("add");
	if (addIndex === -1 || addIndex + 2 >= process.argv.length) return -1;
	return addIndex;
}

function extractOption(
	args: string[],
	flag: string,
): { value: string | undefined; remaining: string[] } {
	const index = args.indexOf(flag);
	if (index === -1) return { value: undefined, remaining: args };
	return {
		value: args[index + 1],
		remaining: [...args.slice(0, index), ...args.slice(index + 2)],
	};
}

function extractAddArgs(addIndex: number) {
	const rawArgs = process.argv.slice(addIndex + 3);
	const { value: cwd, remaining: args } = extractOption(rawArgs, "--cwd");
	return {
		name: process.argv[addIndex + 1],
		command: process.argv[addIndex + 2],
		args,
		cwd,
	};
}

function parseAddArguments() {
	const addIndex = findAddIndex();
	return addIndex === -1 ? null : extractAddArgs(addIndex);
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
	const config = loadProjectConfig();
	if (!config.run) config.run = [];
	return { config, runList: config.run as { name: string }[] };
}

function saveNewRunConfig(
	name: string,
	command: string,
	args: string[],
	cwd?: string,
): void {
	const { config, runList } = getOrInitRunList();
	ensureNoDuplicate(runList, name);
	runList.push(buildRunEntry(name, command, args, { cwd }));
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
	const { name, command, args, cwd } = requireParsedArgs();
	saveNewRunConfig(name, command, args, cwd);
	createCommandFile(name);
	console.log(
		`Added run configuration: ${name} -> ${formatDisplay(command, args)}`,
	);
}
