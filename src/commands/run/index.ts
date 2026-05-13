import { resolve } from "node:path";
import { getConfigDir } from "../../shared/loadConfig";
import type { RunConfig } from "../../shared/types";
import { findRunConfig, requireRunConfigs } from "./findRunConfig";
import { formatConfiguredCommands } from "./formatConfiguredCommands";
import { resolveParams } from "./resolveParams";
import { runPreCommands } from "./runPreCommands";
import { spawnRunCommand } from "./spawnRunCommand";

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
		config.command,
		[...(config.args ?? []), ...resolved],
		config.env,
		cwd,
		config.quiet,
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
