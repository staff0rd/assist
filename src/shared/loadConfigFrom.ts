import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { dropUnknownConfigKeys } from "./dropUnknownConfigKeys";
import { linkedWorktree } from "./linkedWorktree";
import { loadRawYaml } from "./loadRawYaml";
import { mergeRawConfigs } from "./mergeDenyRules";
import { readConfigCacheFile } from "./readRepoConfigCache";
import { resolveRepoLayer } from "./resolveRepoLayer";
import { stripLegacyConfigKeys } from "./stripLegacyConfigKeys";
import { type AssistConfig, assistConfigSchema } from "./types";
import { warnUnsharedAdviceRules } from "./warnUnsharedAdviceRules";

export function findConfigUp(
	startDir: string,
): { configPath: string; rootDir: string } | null {
	let current = startDir;
	while (current !== dirname(current)) {
		const claudePath = join(current, ".claude", "assist.yml");
		if (existsSync(claudePath))
			return { configPath: claudePath, rootDir: current };
		const rootPath = join(current, "assist.yml");
		if (existsSync(rootPath)) return { configPath: rootPath, rootDir: current };
		current = dirname(current);
	}
	return null;
}

function getConfigPathFrom(cwd: string): string {
	const found = findConfigUp(cwd);
	if (found) return found.configPath;
	return join(cwd, "assist.yml");
}

export function getGlobalConfigPath(): string {
	return join(homedir(), ".assist.yml");
}

export function projectConfigPathFrom(cwd: string): string {
	if (findConfigUp(cwd)) return getConfigPathFrom(cwd);
	const clone = linkedWorktree(cwd)?.clone;
	return getConfigPathFrom(clone ?? cwd);
}

export function loadConfigFrom(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): AssistConfig {
	return assistConfigSchema.parse(loadMergedRawConfig(cwd, globalConfigPath));
}

function sharedUserLayer(
	userDb: Record<string, unknown> | undefined,
): Record<string, unknown> {
	return userDb ? dropUnknownConfigKeys(userDb) : {};
}

export function loadMergedRawConfig(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): Record<string, unknown> {
	const globalRaw = loadRawYaml(globalConfigPath);
	const projectRaw = loadRawYaml(projectConfigPathFrom(cwd));
	const userDb = readConfigCacheFile().user;
	warnUnsharedAdviceRules(globalRaw, userDb);
	const globalWithRepo = mergeRawConfigs(
		mergeRawConfigs(sharedUserLayer(userDb), globalRaw),
		resolveRepoLayer(globalRaw, cwd).override,
	);
	const merged = stripLegacyConfigKeys(
		mergeRawConfigs(globalWithRepo, projectRaw),
	);
	delete merged.repos;
	return merged;
}
