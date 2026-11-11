import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { notPerRepoKeyMessage } from "./notPerRepoKeyMessage";

export function globalOnlyRepoKeyError(
	key: string,
	verb: "Set" | "Unset",
): { ok: false; errors: string[] } | undefined {
	if (!isGlobalOnlyConfigKey(key)) return undefined;
	return {
		ok: false,
		errors: [notPerRepoKeyMessage(key, verb)],
	};
}
