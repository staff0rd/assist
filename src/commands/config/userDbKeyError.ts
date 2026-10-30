import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";

const DB_EXCLUDED_ROOTS = ["repos", "database"];

function isNodeOnlyKey(key: string): boolean {
	const root = key.split(".")[0];
	return isGlobalOnlyConfigKey(key) || DB_EXCLUDED_ROOTS.includes(root);
}

export function userDbKeyError(
	key: string,
	verb: "Set" | "Unset",
): { ok: false; errors: string[] } | undefined {
	if (!isNodeOnlyKey(key)) return undefined;
	return {
		ok: false,
		errors: [
			`"${key}" can't be stored in user (db); it stays in user (node). ${verb} it in ~/.assist.yml with -g`,
		],
	};
}
