import { writeFileSync } from "node:fs";
import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import {
	findConfigUp,
	getConfigDirFrom,
	getConfigPathFrom,
	getGlobalConfigPath,
	loadConfigFrom,
} from "./loadConfigFrom";
import { loadRawYaml } from "./loadRawYaml";
import type { AssistConfig, TranscriptConfig } from "./types";

function getConfigPath(): string {
	return getConfigPathFrom(process.cwd());
}

export function getConfigDir(): string {
	return getConfigDirFrom(process.cwd());
}

export function getProjectRoot(): string {
	const found = findConfigUp(process.cwd());
	return found?.rootDir ?? process.cwd();
}

export function loadConfig(): AssistConfig {
	return loadConfigFrom(process.cwd());
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
