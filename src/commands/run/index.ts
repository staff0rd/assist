import { execSync } from "node:child_process";
import { loadConfig } from "../../shared/loadConfig";
import { shellQuote } from "../../shared/shellQuote";
import { formatConfiguredCommands } from "./formatConfiguredCommands";
import { resolveParams } from "./resolveParams";
import { spawnRunCommand } from "./spawnRunCommand";

function buildCommand(
	command: string,
	configArgs: string[],
	extraArgs: string[],
): string {
	const parts = [command, ...configArgs];
	return [...parts.map(shellQuote), ...extraArgs.map(shellQuote)].join(" ");
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

export function listRunConfigs(): void {
	const configs = requireRunConfigs();
	for (const config of configs) {
		const args = config.args?.length ? ` ${config.args.join(" ")}` : "";
		console.log(`${config.name}: ${config.command}${args}`);
	}
}

function runPreCommands(pre: string[]): void {
	for (const cmd of pre) {
		try {
			execSync(cmd, { stdio: "inherit" });
		} catch (err) {
			const code =
				err && typeof err === "object" && "status" in err
					? (err.status as number)
					: 1;
			process.exit(code);
		}
	}
}

export function run(name: string | undefined, args: string[]): void {
	if (!name) {
		console.error("error: missing required argument 'name'");
		console.error(formatConfiguredCommands());
		process.exit(1);
	}
	const runConfig = findRunConfig(name);
	if (runConfig.pre) runPreCommands(runConfig.pre);
	const resolved = resolveParams(runConfig.params, args);
	spawnRunCommand(
		buildCommand(runConfig.command, runConfig.args ?? [], resolved),
		runConfig.env,
	);
}

export { add } from "./add";
