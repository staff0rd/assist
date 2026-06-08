import { resolve } from "node:path";
import { getConfigDir } from "../../shared/loadConfig";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import type { RunConfig } from "../../shared/types";
import { run as backlogRun } from "../backlog/run";
import {
	findRunConfig,
	lookupRunConfig,
	requireRunConfigs,
} from "./findRunConfig";
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

function parseBacklogRunOptions(
	id: string,
	args: string[],
): SpawnClaudeOptions {
	let allowEdits = true;
	for (const arg of args) {
		if (arg === "--write" || arg === "-w") allowEdits = true;
		else if (arg === "--no-write") allowEdits = false;
		else {
			console.error(`error: unexpected argument '${arg}' for 'run ${id}'`);
			process.exit(1);
		}
	}
	return { allowEdits };
}

export async function run(
	name: string | undefined,
	args: string[],
): Promise<void> {
	if (!name) {
		console.error("error: missing required argument 'name'");
		console.error(formatConfiguredCommands());
		process.exit(1);
	}
	if (/^\d+$/.test(name) && lookupRunConfig(name).kind === "not-found") {
		const options = parseBacklogRunOptions(name, args);
		pullIfConfigured();
		await backlogRun(name, options);
		return;
	}
	execRunConfig(findRunConfig(name), args);
}
