import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { linkedWorktree } from "./linkedWorktree";
import { loadRawYaml } from "./loadRawYaml";
import { mergeRawConfigs } from "./mergeDenyRules";
import { resolveRepoLayer } from "./resolveRepoLayer";
import { stripLegacyConfigKeys } from "./stripLegacyConfigKeys";
import { type AssistConfig, assistConfigSchema } from "./types";

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
	const globalRaw = loadRawYaml(globalConfigPath);
	const projectRaw = loadRawYaml(projectConfigPathFrom(cwd));
	const globalWithRepo = mergeRawConfigs(
		globalRaw,
		resolveRepoLayer(globalRaw, cwd).override,
	);
	const merged = stripLegacyConfigKeys(
		mergeRawConfigs(globalWithRepo, projectRaw),
	);
	delete merged.repos;
	return assistConfigSchema.parse(merged);
}
