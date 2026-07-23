import chalk from "chalk";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

const GLOBAL_ONLY_KEYS = ["sync.autoConfirm"];

export function applyConfigSet(
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
