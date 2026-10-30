import { isNodeOnlyConfigKey } from "./isNodeOnlyConfigKey";

export function userDbKeyError(
	key: string,
	verb: "Set" | "Unset",
): { ok: false; errors: string[] } | undefined {
	if (!isNodeOnlyConfigKey(key)) return undefined;
	return {
		ok: false,
		errors: [
			`"${key}" can't be stored in user (db); it stays in user (node). ${verb} it in ~/.assist.yml with --node`,
		],
	};
}
