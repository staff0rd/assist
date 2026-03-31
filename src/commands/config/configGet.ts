import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { getNestedValue } from "./getNestedValue";

export function configGet(key: string): void {
	console.log(
		formatOutput(
			requireNestedValue(loadConfig() as Record<string, unknown>, key),
		),
	);
}

function formatOutput(value: unknown): string {
	return typeof value === "object" && value !== null
		? JSON.stringify(value, null, 2)
		: String(value);
}

function requireNestedValue(
	config: Record<string, unknown>,
	key: string,
): unknown {
	const value = getNestedValue(config, key);
	if (value === undefined) return exitKeyNotSet(key);
	return value;
}

function exitKeyNotSet(key: string): never {
	console.error(chalk.red(`Key "${key}" is not set`));
	process.exit(1);
}
