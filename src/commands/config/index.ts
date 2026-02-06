import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import { loadConfig, saveConfig } from "../../shared/loadConfig";
import { assistConfigSchema } from "../../shared/types";

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	const keys = path.split(".");
	let current: unknown = obj;
	for (const key of keys) {
		if (
			current === null ||
			current === undefined ||
			typeof current !== "object"
		) {
			return undefined;
		}
		current = (current as Record<string, unknown>)[key];
	}
	return current;
}

function setNestedValue(
	obj: Record<string, unknown>,
	path: string,
	value: unknown,
): Record<string, unknown> {
	const keys = path.split(".");
	const result = { ...obj };
	let current = result;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		current[key] =
			current[key] !== null &&
			current[key] !== undefined &&
			typeof current[key] === "object" &&
			!Array.isArray(current[key])
				? { ...(current[key] as Record<string, unknown>) }
				: {};
		current = current[key] as Record<string, unknown>;
	}
	current[keys[keys.length - 1]] = value;
	return result;
}

function coerceValue(value: string): string | boolean {
	if (value === "true") return true;
	if (value === "false") return false;
	return value;
}

export function configSet(key: string, value: string): void {
	const config = loadConfig();
	const coerced = coerceValue(value);
	const updated = setNestedValue(
		config as Record<string, unknown>,
		key,
		coerced,
	);

	const result = assistConfigSchema.safeParse(updated);
	if (!result.success) {
		for (const issue of result.error.issues) {
			const path = issue.path.length > 0 ? issue.path.join(".") : key;
			console.error(chalk.red(`${path}: ${issue.message}`));
		}
		process.exit(1);
	}

	saveConfig(result.data);
	console.log(chalk.green(`Set ${key} = ${JSON.stringify(coerced)}`));
}

export function configGet(key: string): void {
	const config = loadConfig();
	const value = getNestedValue(config as Record<string, unknown>, key);
	if (value === undefined) {
		console.error(chalk.red(`Key "${key}" is not set`));
		process.exit(1);
	}
	if (typeof value === "object" && value !== null) {
		console.log(JSON.stringify(value, null, 2));
	} else {
		console.log(String(value));
	}
}

export function configList(): void {
	const config = loadConfig();
	console.log(stringifyYaml(config, { lineWidth: 0 }).trimEnd());
}
