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

type RunConfigLookup =
	| { kind: "match"; config: RunConfig }
	| { kind: "ambiguous"; matches: RunConfig[] }
	| { kind: "not-found" };

export function lookupRunConfig(name: string): RunConfigLookup {
	const configs = requireRunConfigs();
	const exact = configs.find((r) => r.name === name);
	if (exact) return { kind: "match", config: exact };
	const suffixMatches = configs.filter((r) => r.name.endsWith(`:${name}`));
	if (suffixMatches.length === 1)
		return { kind: "match", config: suffixMatches[0] };
	if (suffixMatches.length > 1)
		return { kind: "ambiguous", matches: suffixMatches };
	return { kind: "not-found" };
}

export function findRunConfig(name: string): RunConfig {
	const result = lookupRunConfig(name);
	if (result.kind === "match") return result.config;
	if (result.kind === "ambiguous")
		return exitWithAmbiguousConfig(name, result.matches);
	return exitWithConfigNotFound(name, requireRunConfigs());
}
