import { getConfigDir, loadConfig } from "../../shared/loadConfig";
import { resolveRunConfigs } from "../../shared/resolveRunConfigs";
import type { RunConfig } from "../../shared/types";

function exitNoRunConfigs(): never {
	console.error("No run configurations found in assist.yml");
	process.exit(1);
}

function exitWithConfigNotFound(
	name: string,
	configs: { name: string }[],
): never {
	console.error(`No run configuration found with name: ${name}`);
	console.error("Available configurations:");
	for (const r of configs) {
		console.error(`  - ${r.name}`);
	}
	process.exit(1);
}

function exitWithAmbiguousConfig(
	name: string,
	matches: { name: string }[],
): never {
	console.error(`Ambiguous run configuration: ${name}`);
	console.error("Did you mean:");
	for (const r of matches) {
		console.error(`  - ${r.name}`);
	}
	process.exit(1);
}

export function requireRunConfigs(): RunConfig[] {
	const { run } = loadConfig();
	const configs = resolveRunConfigs(run, getConfigDir());
	if (configs.length === 0) return exitNoRunConfigs();
	return configs;
}

export function findRunConfig(name: string) {
	const configs = requireRunConfigs();
	const exact = configs.find((r) => r.name === name);
	if (exact) return exact;
	const suffixMatches = configs.filter((r) => r.name.endsWith(`:${name}`));
	if (suffixMatches.length === 1) return suffixMatches[0];
	if (suffixMatches.length > 1)
		return exitWithAmbiguousConfig(name, suffixMatches);
	return exitWithConfigNotFound(name, configs);
}
