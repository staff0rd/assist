import { resolve } from "node:path";
import { getConfigDir, loadConfig } from "../../shared/loadConfig";
import { resolveRunConfigs } from "../../shared/resolveRunConfigs";
import { shellQuote } from "../../shared/shellQuote";
import type { RunConfig } from "../../shared/types";
import { formatConfiguredCommands } from "./formatConfiguredCommands";
import { resolveParams } from "./resolveParams";
import { runPreCommands } from "./runPreCommands";
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

function requireRunConfigs(): RunConfig[] {
	const { run } = loadConfig();
	const configs = resolveRunConfigs(run, getConfigDir());
	if (configs.length === 0) return exitNoRunConfigs();
	return configs;
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

export function listRunConfigs(verbose: boolean): void {
	const configs = requireRunConfigs();
	for (const config of configs) {
		if (verbose) {
			const args = config.args?.length ? ` ${config.args.join(" ")}` : "";
			console.log(`${config.name}: ${config.command}${args}`);
		} else {
			console.log(config.name);
		}
	}
}

function execRunConfig(config: RunConfig, args: string[]): void {
	const cwd = config.cwd ? resolve(getConfigDir(), config.cwd) : undefined;
	if (config.pre) runPreCommands(config.pre, cwd);
	const resolved = resolveParams(config.params, args);
	spawnRunCommand(
		buildCommand(config.command, config.args ?? [], resolved),
		config.env,
		cwd,
	);
}

export function run(name: string | undefined, args: string[]): void {
	if (!name) {
		console.error("error: missing required argument 'name'");
		console.error(formatConfiguredCommands());
		process.exit(1);
	}
	execRunConfig(findRunConfig(name), args);
}
