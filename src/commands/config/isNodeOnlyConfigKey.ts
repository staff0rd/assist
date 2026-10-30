import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";

const DB_EXCLUDED_ROOTS = ["repos", "database"];

export function isNodeOnlyConfigKey(key: string): boolean {
	const root = key.split(".")[0];
	return isGlobalOnlyConfigKey(key) || DB_EXCLUDED_ROOTS.includes(root);
}
