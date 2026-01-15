import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { AssistConfig } from "./types";

function getConfigPath(): string {
	const claudeConfigPath = join(process.cwd(), ".claude", "assist.yml");
	if (existsSync(claudeConfigPath)) {
		return claudeConfigPath;
	}
	return join(process.cwd(), "assist.yml");
}

export function loadConfig(): AssistConfig {
	const configPath = getConfigPath();
	if (!existsSync(configPath)) {
		return {};
	}
	try {
		const content = readFileSync(configPath, "utf-8");
		return parseYaml(content) || {};
	} catch {
		return {};
	}
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
