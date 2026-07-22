import chalk from "chalk";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";
import { applyRepoConfigSet } from "./applyRepoConfigSet";

type ConfigSetOptions = {
	global?: boolean;
	repo?: boolean;
};

const GLOBAL_ONLY_KEYS = ["sync.autoConfirm"];

export function configSet(
	key: string,
	value: string,
	options: ConfigSetOptions = {},
): void {
	const coerced = coerceValue(value);
	if (options.repo && options.global) {
		console.error(chalk.red("Use either --repo or --global, not both"));
		process.exit(1);
	}
	const target = options.repo
		? `repo: ${applyRepoConfigSet(key, coerced)}`
		: applyConfigSet(key, coerced, options.global ?? false);
	console.log(
		chalk.green(`Set ${key} = ${JSON.stringify(coerced)} (${target})`),
	);
}

function coerceValue(value: string): string | boolean {
	if (value === "true") return true;
	if (value === "false") return false;
	return value;
}

function applyConfigSet(
	key: string,
	coerced: string | boolean,
	global: boolean,
): string {
	assertNotGlobalOnly(key, global);
	const raw = global ? loadGlobalConfigRaw() : loadProjectConfig();
	const updated = setNestedValue(raw, key, coerced);
	validateConfig(updated, key);
	if (global) {
		saveGlobalConfig(updated);
		return "global";
	}
	saveConfig(updated);
	return "project";
}

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
