import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { notPerRepoKeyMessage } from "./notPerRepoKeyMessage";
import { unsetNestedValue } from "./unsetNestedValue";
import { validateConfig } from "./validateConfig";

type ConfigUnsetResult =
	| { ok: true; target: "global" | "project"; removed: boolean }
	| { ok: false; errors: string[] };

export function applyConfigUnset(
	key: string,
	global: boolean,
	cwd: string = process.cwd(),
	globalConfigPath?: string,
): ConfigUnsetResult {
	if (!global && isGlobalOnlyConfigKey(key)) {
		return {
			ok: false,
			errors: [notPerRepoKeyMessage(key, "Unset")],
		};
	}
	const target = global ? "global" : "project";
	const raw = global
		? loadGlobalConfigRaw(globalConfigPath)
		: loadProjectConfig(cwd);
	const { config, removed } = unsetNestedValue(raw, key);
	if (!removed) return { ok: true, target, removed: false };

	const validation = validateConfig(config, key);
	if (!validation.ok) return validation;

	if (global) saveGlobalConfig(config, globalConfigPath);
	else saveConfig(config, cwd);
	return { ok: true, target, removed: true };
}
