import { applyConfigUnset } from "../../config/applyConfigUnset";
import { applySharedRepoConfigUnset } from "../../config/applySharedRepoConfigUnset";
import { applyUserConfigUnset } from "../../config/applyUserConfigUnset";
import type { ConfigWriteScope } from "../../config/ConfigWriteScope";

type ScopedConfigUnsetResult =
	| { ok: true; payload: Record<string, unknown> }
	| { ok: false; errors: string[] };

export async function applyScopedConfigUnset(
	key: string,
	cwd: string,
	scope: ConfigWriteScope,
	globalConfigPath?: string,
): Promise<ScopedConfigUnsetResult> {
	if (scope === "repo") {
		const result = await applySharedRepoConfigUnset(key, undefined, cwd);
		return result.ok
			? {
					ok: true,
					payload: {
						target: result.target,
						repoKey: result.label,
						removed: result.removed,
					},
				}
			: result;
	}
	if (scope === "user") {
		const result = await applyUserConfigUnset(key);
		return result.ok
			? {
					ok: true,
					payload: { target: result.target, removed: result.removed },
				}
			: result;
	}
	const result = applyConfigUnset(
		key,
		scope === "global",
		cwd,
		globalConfigPath,
	);
	return result.ok
		? { ok: true, payload: { target: result.target, removed: result.removed } }
		: result;
}
