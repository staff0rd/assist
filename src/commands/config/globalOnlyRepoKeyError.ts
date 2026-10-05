import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";

export function globalOnlyRepoKeyError(
	key: string,
	verb: "Set" | "Unset",
): { ok: false; errors: string[] } | undefined {
	if (!isGlobalOnlyConfigKey(key)) return undefined;
	return {
		ok: false,
		errors: [
			`"${key}" is a global-only key. ${verb} it in ~/.assist.yml rather than under repos:`,
		],
	};
}
