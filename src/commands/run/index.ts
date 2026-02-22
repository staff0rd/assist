import { spawn } from "node:child_process";
import { loadConfig } from "../../shared/loadConfig";

function quoteIfNeeded(arg: string): string {
	return arg.includes(" ") ? `"${arg}"` : arg;
}

function buildCommand(
	command: string,
	configArgs: string[],
	extraArgs: string[],
): string {
	const allArgs = [...configArgs, ...extraArgs];
	return [quoteIfNeeded(command), ...allArgs.map(quoteIfNeeded)].join(" ");
}

function printAvailableConfigs(configs: { name: string }[]): void {
	console.error("Available configurations:");
	for (const r of configs) {
		console.error(`  - ${r.name}`);
	}
}

function exitNoRunConfigs(): never {
	console.error("No run configurations found in assist.yml");
	process.exit(1);
}

function requireRunConfigs() {
	const { run } = loadConfig();
	if (!run || run.length === 0) return exitNoRunConfigs();
	return run;
}

function exitWithConfigNotFound(
	name: string,
	configs: { name: string }[],
): never {
	console.error(`No run configuration found with name: ${name}`);
	printAvailableConfigs(configs);
	process.exit(1);
}

function findRunConfig(name: string) {
	const configs = requireRunConfigs();
	return (
		configs.find((r) => r.name === name) ??
		exitWithConfigNotFound(name, configs)
	);
}

function onSpawnError(err: Error): void {
	console.error(`Failed to execute command: ${err.message}`);
	process.exit(1);
}

function spawnCommand(fullCommand: string): void {
	const child = spawn(fullCommand, [], { stdio: "inherit", shell: true });
	child.on("close", (code) => process.exit(code ?? 0));
	child.on("error", onSpawnError);
}

export function listRunConfigs(): void {
	const configs = requireRunConfigs();
	for (const config of configs) {
		const args = config.args?.length ? ` ${config.args.join(" ")}` : "";
		console.log(`${config.name}: ${config.command}${args}`);
	}
}

export function run(name: string, args: string[]): void {
	const runConfig = findRunConfig(name);
	spawnCommand(buildCommand(runConfig.command, runConfig.args ?? [], args));
}

export { add } from "./add";
