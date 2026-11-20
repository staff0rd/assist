import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { linkedWorktree } from "./linkedWorktree";
import { mergeRawConfigs } from "./mergeDenyRules";
import { loadRawConfigLayers } from "./loadRawConfigLayers";
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

export function projectConfigWritePathFrom(cwd: string): string {
	if (findConfigUp(cwd)) return getConfigPathFrom(cwd);
	const worktree = linkedWorktree(cwd);
	if (!worktree) return getConfigPathFrom(cwd);
	const clonePath = getConfigPathFrom(worktree.clone);
	return join(worktree.root, relative(worktree.clone, clonePath));
}

export function loadConfigFrom(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): AssistConfig {
	return assistConfigSchema.parse(loadMergedRawConfig(cwd, globalConfigPath));
}

export function loadMergedRawConfig(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): Record<string, unknown> {
	const layers = loadRawConfigLayers(
		cwd,
		globalConfigPath,
		projectConfigPathFrom(cwd),
	);
	warnUnsharedAdviceRules(layers.global, layers.userDbRaw);
	const globalWithRepo = mergeRawConfigs(
		mergeRawConfigs(layers.user, layers.global),
		layers.repo,
	);
	const merged = stripLegacyConfigKeys(
		mergeRawConfigs(globalWithRepo, layers.project),
	);
	delete merged.repos;
	return merged;
}
