import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { notPerRepoKeyMessage } from "./notPerRepoKeyMessage";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

export type ConfigScalar = string | number | boolean;

export type ConfigWritableValue =
	| ConfigScalar
	| unknown[]
	| Record<string, unknown>;

type ConfigSetResult =
	| { ok: true; target: "global" | "project" }
	| { ok: false; errors: string[] };

export function applyConfigSet(
	key: string,
	coerced: ConfigWritableValue,
	global: boolean,
	cwd: string = process.cwd(),
	globalConfigPath?: string,
): ConfigSetResult {
	if (!global && isGlobalOnlyConfigKey(key)) {
		return {
			ok: false,
			errors: [notPerRepoKeyMessage(key, "Set")],
		};
	}
	const raw = global
		? loadGlobalConfigRaw(globalConfigPath)
		: loadProjectConfig(cwd);
	const updated = setNestedValue(raw, key, coerced);
	const validation = validateConfig(updated, key);
	if (!validation.ok) return validation;
	if (global) {
		saveGlobalConfig(updated, globalConfigPath);
		return { ok: true, target: "global" };
	}
	saveConfig(updated, cwd);
	return { ok: true, target: "project" };
}
