import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import {
	loadConfig,
	loadProjectConfig,
	saveConfig,
} from "../../shared/loadConfig";
import { assistConfigSchema } from "../../shared/types";
import { getNestedValue } from "./getNestedValue";
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

function applyConfigSet(key: string, coerced: string | boolean): void {
	const updated = setNestedValue(loadProjectConfig(), key, coerced);
	saveConfig(validateConfig(updated, key));
}

export function configSet(key: string, value: string): void {
	const coerced = coerceValue(value);
	applyConfigSet(key, coerced);
	console.log(chalk.green(`Set ${key} = ${JSON.stringify(coerced)}`));
}

function formatOutput(value: unknown): string {
	return typeof value === "object" && value !== null
		? JSON.stringify(value, null, 2)
		: String(value);
}

function exitKeyNotSet(key: string): never {
	console.error(chalk.red(`Key "${key}" is not set`));
	process.exit(1);
}

function requireNestedValue(
	config: Record<string, unknown>,
	key: string,
): unknown {
	const value = getNestedValue(config, key);
	if (value === undefined) return exitKeyNotSet(key);
	return value;
}

export function configGet(key: string): void {
	console.log(
		formatOutput(
			requireNestedValue(loadConfig() as Record<string, unknown>, key),
		),
	);
}

export function configList(): void {
	const config = loadConfig();
	console.log(stringifyYaml(config, { lineWidth: 0 }).trimEnd());
}
