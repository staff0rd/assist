import { getDb } from "../../shared/db/getDb";
import { updateUserConfig } from "../../shared/db/updateUserConfig";
import { refreshRepoConfigCache } from "../../shared/refreshRepoConfigCache";
import { unsetNestedValue } from "./unsetNestedValue";
import { userDbKeyError } from "./userDbKeyError";
import { validateConfig } from "./validateConfig";

type UserConfigUnsetResult =
	| { ok: true; target: "user"; removed: boolean }
	| { ok: false; errors: string[] };

export async function applyUserConfigUnset(
	key: string,
): Promise<UserConfigUnsetResult> {
	const nodeOnly = userDbKeyError(key, "Unset");
	if (nodeOnly) return nodeOnly;
	const orm = await getDb();
	const outcome = await updateUserConfig(orm, (current) => {
		const { config, removed } = unsetNestedValue(current, key);
		if (!removed) return { ok: true, config: current, result: false };
		const validation = validateConfig(config, key);
		return validation.ok ? { ok: true, config, result: true } : validation;
	});
	if (!outcome.ok) return outcome;
	if (outcome.result) await refreshRepoConfigCache(orm);
	return { ok: true, target: "user", removed: outcome.result };
}
