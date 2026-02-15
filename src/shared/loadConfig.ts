import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import chalk from "chalk";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
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

function loadRawConfig(path: string): Record<string, unknown> {
	if (!existsSync(path)) return {};
	try {
		const content = readFileSync(path, "utf-8");
		return (parseYaml(content) as Record<string, unknown>) || {};
	} catch {
		return {};
	}
}

export function loadConfig(): AssistConfig {
	const globalRaw = loadRawConfig(getGlobalConfigPath());
	const projectRaw = loadRawConfig(getConfigPath());
	const merged = { ...globalRaw, ...projectRaw };
	return assistConfigSchema.parse(merged);
}

export function loadGlobalConfig(): AssistConfig {
	const raw = loadRawConfig(getGlobalConfigPath());
	return assistConfigSchema.parse(raw);
}

export function saveGlobalConfig(config: AssistConfig): void {
	writeFileSync(getGlobalConfigPath(), stringifyYaml(config, { lineWidth: 0 }));
}

export function saveConfig(config: AssistConfig): void {
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
