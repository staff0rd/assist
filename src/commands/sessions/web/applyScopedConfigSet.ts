import {
	applyConfigSet,
	type ConfigWritableValue,
} from "../../config/applyConfigSet";
import { applySharedRepoConfigSet } from "../../config/applySharedRepoConfigSet";
import type { ConfigWriteScope } from "../../config/ConfigWriteScope";

type ScopedConfigSetResult =
	| { ok: true; payload: Record<string, unknown> }
	| { ok: false; errors: string[] };

export async function applyScopedConfigSet(
	key: string,
	value: ConfigWritableValue,
	cwd: string,
	scope: ConfigWriteScope,
	globalConfigPath?: string,
): Promise<ScopedConfigSetResult> {
	if (scope === "repo") {
		const result = await applySharedRepoConfigSet(key, value, undefined, cwd);
		return result.ok
			? { ok: true, payload: { target: result.target, repoKey: result.label } }
			: result;
	}
	const result = applyConfigSet(
		key,
		value,
		scope === "global",
		cwd,
		globalConfigPath,
	);
	return result.ok ? { ok: true, payload: { target: result.target } } : result;
}
