import { isNodeOnlyConfigKey } from "./isNodeOnlyConfigKey";

export function notPerRepoKeyMessage(
	key: string,
	verb: "Set" | "Unset",
): string {
	const where = isNodeOnlyConfigKey(key)
		? "in user (node) with --node"
		: "in user (node) with --node or in user (db) with --user";
	return `"${key}" can't be stored per repo. ${verb} it ${where}`;
}
