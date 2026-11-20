import { pullIfConfigured } from "../shared/pullIfConfigured";
import type { SpawnClaudeOptions } from "../shared/spawnClaude";
import type { RunConfig } from "../shared/types";
import { run as backlogRun } from "./backlog/run";
import {
	exitNoRunConfigs,
	findRunConfig,
	lookupRunConfig,
	requireRunConfigs,
} from "./run/findRunConfig";
import { formatConfiguredCommands } from "./run/formatConfiguredCommands";
import { formatRunEntry } from "./run/formatRunEntry";
import { loadSourcedRunConfigs } from "./run/loadSourcedRunConfigs";
import { resolveParams } from "./run/resolveParams";
import { resolveRunCwd } from "./run/resolveRunCwd";
import { runPreCommands } from "./run/runPreCommands";
import { spawnRunCommand } from "./run/spawnRunCommand";

export function listRunConfigs(verbose: boolean): void {
	if (!verbose) {
		for (const config of requireRunConfigs()) console.log(config.name);
		return;
	}
	const sourced = loadSourcedRunConfigs(process.cwd());
	if (sourced.length === 0) exitNoRunConfigs();
	for (const { config, source } of sourced)
		console.log(formatRunEntry(config, source));
}

function execRunConfig(config: RunConfig, args: string[]): void {
	const cwd = resolveRunCwd(config);
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

async function tryBacklogRunAlias(
	name: string,
	args: string[],
): Promise<boolean> {
	if (!/^a?\d+$/.test(name)) return false;
	if (lookupRunConfig(name).kind !== "not-found") return false;
	await pullIfConfigured();
	await backlogRun(name, parseBacklogRunOptions(name, args));
	return true;
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
	if (await tryBacklogRunAlias(name, args)) return;
	execRunConfig(findRunConfig(name), args);
}
