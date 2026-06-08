import { existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import { loadRawYaml } from "./loadRawYaml";
import { mergeRawConfigs } from "./mergeDenyRules";
import {
	type AssistConfig,
	assistConfigSchema,
	type TranscriptConfig,
} from "./types";

function findConfigUp(
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

function getConfigPath(): string {
	const found = findConfigUp(process.cwd());
	if (found) return found.configPath;
	// Fallback: default to cwd-based path (for creation)
	return join(process.cwd(), "assist.yml");
}

function getGlobalConfigPath(): string {
	return join(homedir(), ".assist.yml");
}

export function getConfigDir(): string {
	return dirname(getConfigPath());
}

export function getProjectRoot(): string {
	const found = findConfigUp(process.cwd());
	return found?.rootDir ?? process.cwd();
}

export function loadConfig(): AssistConfig {
	const globalRaw = loadRawYaml(getGlobalConfigPath());
	const projectRaw = loadRawYaml(getConfigPath());
	const merged = mergeRawConfigs(globalRaw, projectRaw);
	return assistConfigSchema.parse(merged);
}

export function loadProjectConfig(): Record<string, unknown> {
	return loadRawYaml(getConfigPath());
}

export function loadGlobalConfigRaw(): Record<string, unknown> {
	return loadRawYaml(getGlobalConfigPath());
}

export function saveGlobalConfig(config: Record<string, unknown>): void {
	writeFileSync(getGlobalConfigPath(), stringifyYaml(config, { lineWidth: 0 }));
}

export function saveConfig(config: Record<string, unknown>): void {
	const configPath = getConfigPath();
	writeFileSync(configPath, stringifyYaml(config, { lineWidth: 0 }));
}

export function getTranscriptConfig(): TranscriptConfig {
	const config = loadConfig();
	if (!config.transcript) {
		console.error(
			chalk.red(
				"Transcript directories not configured. Run 'assist transcript configure' first.",
			),
		);
		process.exit(1);
	}
	return config.transcript;
}
