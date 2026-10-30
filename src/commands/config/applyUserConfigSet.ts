import { getDb } from "../../shared/db/getDb";
import { updateUserConfig } from "../../shared/db/updateUserConfig";
import { refreshRepoConfigCache } from "../../shared/refreshRepoConfigCache";
import type { ConfigWritableValue } from "./applyConfigSet";
import { getNestedValue } from "./getNestedValue";
import { setNestedValue } from "./setNestedValue";
import { userDbKeyError } from "./userDbKeyError";
import { validateConfig } from "./validateConfig";

type UserConfigSetResult =
	| { ok: true; target: "user" }
	| { ok: false; errors: string[] };

export async function applyUserConfigSet(
	key: string,
	coerced: ConfigWritableValue | ((current: unknown) => ConfigWritableValue),
): Promise<UserConfigSetResult> {
	const nodeOnly = userDbKeyError(key, "Set");
	if (nodeOnly) return nodeOnly;
	const orm = await getDb();
	const outcome = await updateUserConfig(orm, (current) => {
		const value =
			typeof coerced === "function"
				? coerced(getNestedValue(current, key))
				: coerced;
		const config = setNestedValue(current, key, value);
		const validation = validateConfig(config, key);
		return validation.ok ? { ok: true, config, result: undefined } : validation;
	});
	if (!outcome.ok) return outcome;
	await refreshRepoConfigCache(orm);
	return { ok: true, target: "user" };
}
