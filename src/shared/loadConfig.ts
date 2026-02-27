import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import { loadRawYaml } from "./loadRawYaml";
import {
	type AssistConfig,
	assistConfigSchema,
	type TranscriptConfig,
} from "./types";

function getConfigPath(): string {
	const claudeConfigPath = join(process.cwd(), ".claude", "assist.yml");
	if (existsSync(claudeConfigPath)) {
		return claudeConfigPath;
	}
	return join(process.cwd(), "assist.yml");
}

function getGlobalConfigPath(): string {
	return join(homedir(), ".assist.yml");
}

export function loadConfig(): AssistConfig {
	const globalRaw = loadRawYaml(getGlobalConfigPath());
	const projectRaw = loadRawYaml(getConfigPath());
	const merged = { ...globalRaw, ...projectRaw };
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

export function getRepoName(): string {
	const config = loadConfig();
	if (config.devlog?.name) {
		return config.devlog.name;
	}

	const packageJsonPath = join(process.cwd(), "package.json");
	if (existsSync(packageJsonPath)) {
		try {
			const content = readFileSync(packageJsonPath, "utf-8");
			const pkg = JSON.parse(content);
			if (pkg.name) {
				return pkg.name;
			}
		} catch {
			// Fall through to directory name
		}
	}
	return basename(process.cwd());
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
