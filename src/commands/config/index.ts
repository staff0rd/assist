import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import {
	loadConfig,
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { assistConfigSchema } from "../../shared/types";
import { setNestedValue } from "./setNestedValue";

function coerceValue(value: string): string | boolean {
	if (value === "true") return true;
	if (value === "false") return false;
	return value;
}

function formatIssuePath(issue: { path: PropertyKey[] }, key: string): string {
	return issue.path.length > 0 ? issue.path.join(".") : key;
}

function printValidationErrors(
	issues: { path: PropertyKey[]; message: string }[],
	key: string,
): void {
	for (const issue of issues) {
		console.error(
			chalk.red(`${formatIssuePath(issue, key)}: ${issue.message}`),
		);
	}
}

function exitValidationFailed(
	issues: { path: PropertyKey[]; message: string }[],
	key: string,
): never {
	printValidationErrors(issues, key);
	process.exit(1);
}

function validateConfig(
	updated: Record<string, unknown>,
	key: string,
): Record<string, unknown> {
	const result = assistConfigSchema.safeParse(updated);
	if (!result.success) return exitValidationFailed(result.error.issues, key);
	return updated;
}

const GLOBAL_ONLY_KEYS = ["sync.autoConfirm"];

function assertNotGlobalOnly(key: string, global: boolean): void {
	if (!global && GLOBAL_ONLY_KEYS.some((k) => key.startsWith(k))) {
		console.error(
			chalk.red(
				`"${key}" is a global-only key. Use --global to set it in ~/.assist.yml`,
			),
		);
		process.exit(1);
	}
}

function applyConfigSet(
	key: string,
	coerced: string | boolean,
	global: boolean,
): void {
	assertNotGlobalOnly(key, global);
	const raw = global ? loadGlobalConfigRaw() : loadProjectConfig();
	const updated = setNestedValue(raw, key, coerced);
	validateConfig(updated, key);
	if (global) {
		saveGlobalConfig(updated);
	} else {
		saveConfig(updated);
	}
}

type ConfigSetOptions = {
	global?: boolean;
};

export function configSet(
	key: string,
	value: string,
	options: ConfigSetOptions = {},
): void {
	const coerced = coerceValue(value);
	applyConfigSet(key, coerced, options.global ?? false);
	const target = options.global ? "global" : "project";
	console.log(
		chalk.green(`Set ${key} = ${JSON.stringify(coerced)} (${target})`),
	);
}

export function configList(): void {
	const config = loadConfig();
	console.log(stringifyYaml(config, { lineWidth: 0 }).trimEnd());
}
