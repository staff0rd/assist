import chalk from "chalk";
import { describeConfigLeaves } from "../../shared/describeConfigLeaves";
import { loadConfig } from "../../shared/loadConfig";
import { assistConfigSchema } from "../../shared/types";
import { configHelpForKey } from "./configHelpForKey";
import { formatConfigDefault } from "./formatConfigDefault";
import { getNestedValue } from "./getNestedValue";
import { maskConfigKeySecrets } from "./maskConfigKeySecrets";
import {
	dbBackedKeysIn,
	withDbBackedConfigValues,
} from "./withDbBackedConfigValues";

type ConfigGetOptions = { reveal?: boolean };

export function configGet(
	key: string,
	options: ConfigGetOptions = {},
): void | Promise<void> {
	const config = loadConfig() as Record<string, unknown>;
	const dbKeys = dbBackedKeysIn(key);
	if (dbKeys.length === 0) return printValue(config, key, options);
	return withDbBackedConfigValues(config, dbKeys).then((merged) =>
		printValue(merged, key, options),
	);
}

function printValue(
	config: Record<string, unknown>,
	key: string,
	options: ConfigGetOptions,
): void {
	const value = getNestedValue(config, key);
	if (value === undefined) return printUnset(key);
	console.log(
		formatOutput(options.reveal ? value : maskConfigKeySecrets(key, value)),
	);
}

function formatOutput(value: unknown): string {
	return typeof value === "object" && value !== null
		? JSON.stringify(value, null, 2)
		: String(value);
}

function printUnset(key: string): void {
	const leaf = describeConfigLeaves(assistConfigSchema).find(
		(candidate) => candidate.key === key,
	);
	if (!leaf) {
		console.error(chalk.red(`Key "${key}" is not set`));
		process.exit(1);
	}

	console.log(
		leaf.defaultValue === undefined
			? `Key "${key}" is not set and has no schema default`
			: `Key "${key}" is not set; the schema default is ${formatConfigDefault(leaf)}`,
	);
	const help = configHelpForKey(key);
	if (help) console.log(`${help.note}\n${chalk.green(help.setter)}`);
}
