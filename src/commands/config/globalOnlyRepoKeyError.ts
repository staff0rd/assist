import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";

export function globalOnlyRepoKeyError(
	key: string,
	verb: "Set" | "Unset",
): { ok: false; errors: string[] } | undefined {
	if (!isGlobalOnlyConfigKey(key)) return undefined;
	return {
		ok: false,
		errors: [
			`"${key}" is a user (node)-only key. ${verb} it in ~/.assist.yml with --node rather than in repo (db)`,
		],
	};
}
